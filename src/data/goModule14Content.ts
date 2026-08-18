import type { Module } from "../types"

export const goModule14: Module = {
  id: 14,
  title: "Databases & Persistence",
  status: "upcoming",
  lessons: [
    {
      name: "database/sql Basics",
      minutes: 9,
      intro: "Connect to a database using Go's standard, driver-agnostic SQL interface.",
      content: `## One API, many databases

Go doesn't ship a database driver — it ships \`database/sql\`, a generic interface that any driver can plug into. You write against \`*sql.DB\` regardless of whether the underlying database is Postgres, MySQL, or SQLite.

### Registering a driver

Drivers register themselves with \`database/sql\` via a **blank import** — you import the package purely for its side effect (calling \`init()\`), not to use its exported names directly:

\`\`\`go
import (
	"database/sql"

	_ "github.com/lib/pq"           // Postgres driver
	// _ "modernc.org/sqlite"       // pure-Go SQLite driver
)
\`\`\`

The underscore tells Go "import this for its side effects, I'm not calling anything on it directly" — silencing the unused-import error.

### sql.Open does not connect

This trips up almost everyone the first time:

\`\`\`go
db, err := sql.Open("postgres", "postgres://user:pass@localhost/mydb?sslmode=disable")
if err != nil {
	log.Fatal(err)
}
defer db.Close()
\`\`\`

\`sql.Open\` just **validates the arguments and prepares a connection pool** — it doesn't actually dial the database. A typo in the password won't fail here; it'll fail on the first query.

### Verifying the connection with Ping

To fail fast at startup, explicitly ping:

\`\`\`go
if err := db.Ping(); err != nil {
	log.Fatalf("cannot reach database: %v", err)
}
fmt.Println("connected!")
\`\`\`

Run this once during startup so a misconfigured connection string surfaces immediately, not on your first user request.

### Connection pool settings

\`*sql.DB\` isn't a single connection — it's a pool. Tune it for your workload:

\`\`\`go
db.SetMaxOpenConns(25)                  // max simultaneous connections
db.SetMaxIdleConns(25)                  // keep this many idle, ready to reuse
db.SetConnMaxLifetime(5 * time.Minute)  // recycle connections periodically
\`\`\`

| Setting | Purpose |
|---------|---------|
| \`SetMaxOpenConns\` | Caps total connections — protects the database from being overwhelmed |
| \`SetMaxIdleConns\` | Keeps warm connections around to avoid reconnect latency |
| \`SetConnMaxLifetime\` | Forces periodic reconnects — helpful behind load balancers that drop stale connections |

### Putting it together

\`\`\`go
func newDB(dsn string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("opening db: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("pinging db: %w", err)
	}

	return db, nil
}
\`\`\`

> **Key idea:** \`sql.Open\` only prepares a connection pool — it never guarantees the database is reachable. Always follow it with \`db.Ping()\` so bad configuration fails loudly at startup instead of silently on the first request.`,
    },
    {
      name: "Queries and Scanning Rows",
      minutes: 11,
      intro: "Pull data out of SQL rows into Go values — safely, every time.",
      content: `## Query vs QueryRow

\`database/sql\` gives you two ways to run a \`SELECT\`, depending on how many rows you expect back.

| Method | Use when | Returns |
|--------|----------|---------|
| \`db.QueryRow(...)\` | You expect exactly zero or one row | A single \`*sql.Row\` |
| \`db.Query(...)\` | You expect zero or more rows | A \`*sql.Rows\` iterator |

### QueryRow: fetching a single record

\`\`\`go
func getUser(db *sql.DB, id int) (User, error) {
	var u User
	err := db.QueryRow(
		"SELECT id, name, email FROM users WHERE id = $1", id,
	).Scan(&u.ID, &u.Name, &u.Email)

	if errors.Is(err, sql.ErrNoRows) {
		return User{}, fmt.Errorf("user %d not found", id)
	}
	if err != nil {
		return User{}, fmt.Errorf("querying user: %w", err)
	}
	return u, nil
}
\`\`\`

\`Scan\` copies each selected column into the address of a Go variable, in order. When no row matches, \`Scan\` returns \`sql.ErrNoRows\` — check for it explicitly rather than treating it as a generic failure.

### Query: iterating multiple rows

\`\`\`go
func listUsers(db *sql.DB) ([]User, error) {
	rows, err := db.Query("SELECT id, name, email FROM users ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("querying users: %w", err)
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {
			return nil, fmt.Errorf("scanning user: %w", err)
		}
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating users: %w", err)
	}
	return users, nil
}
\`\`\`

### Three habits that matter every time

1. **Always \`defer rows.Close()\`** right after checking the \`Query\` error — leaving rows open leaks the underlying connection back to the pool
2. **Always check \`rows.Err()\`** after the loop — \`rows.Next()\` returning \`false\` can mean "done" or "an error happened mid-iteration," and only \`rows.Err()\` tells them apart
3. **Scan into the exact number of selected columns**, in the same order — a mismatch is a runtime error, not a compile-time one

### Parameterized queries: never concatenate SQL

\`\`\`go
// DO — placeholder is sent separately from the SQL text
db.QueryRow("SELECT * FROM users WHERE email = $1", userInput)

// NEVER — this is a SQL injection vulnerability
db.QueryRow("SELECT * FROM users WHERE email = '" + userInput + "'")
\`\`\`

Placeholder syntax depends on the driver: Postgres uses \`$1, $2, ...\`, while MySQL and SQLite use \`?\`. The driver sends the query text and the parameters separately, so user input is never interpreted as SQL — it's always treated as a literal value, no matter what characters it contains.

\`\`\`go
// even something like this is safe with placeholders
name := "Robert'); DROP TABLE users;--"
db.QueryRow("SELECT * FROM users WHERE name = $1", name) // treated as a literal string
\`\`\`

> **Key idea:** Use \`QueryRow\` for one row, \`Query\` plus \`rows.Next()\`/\`Scan\` for many, always \`defer rows.Close()\`, and always pass user input as a placeholder parameter — never build SQL strings by concatenation.`,
    },
    {
      name: "Transactions and Error Handling",
      minutes: 10,
      intro: "Group multiple statements into one all-or-nothing unit of work.",
      content: `## Why transactions exist

Suppose transferring money between two accounts requires two \`UPDATE\` statements. If the first succeeds and the second fails, you've silently lost money from one account without crediting the other. A **transaction** makes a group of statements atomic: either all of them apply, or none do.

### Begin, Commit, Rollback

\`\`\`go
tx, err := db.Begin()
if err != nil {
	return fmt.Errorf("starting transaction: %w", err)
}

_, err = tx.Exec("UPDATE accounts SET balance = balance - $1 WHERE id = $2", amount, fromID)
if err != nil {
	tx.Rollback()
	return fmt.Errorf("debiting account: %w", err)
}

_, err = tx.Exec("UPDATE accounts SET balance = balance + $1 WHERE id = $2", amount, toID)
if err != nil {
	tx.Rollback()
	return fmt.Errorf("crediting account: %w", err)
}

if err := tx.Commit(); err != nil {
	return fmt.Errorf("committing transaction: %w", err)
}
\`\`\`

Every statement runs against \`tx\`, not \`db\`, so they all share the same underlying connection and the same atomic scope.

### The defer-with-named-error pattern

Manually calling \`tx.Rollback()\` on every error path works, but it's easy to miss one. A cleaner pattern uses a **named return** plus a single \`defer\` that decides whether to commit or roll back:

\`\`\`go
func transfer(db *sql.DB, fromID, toID int, amount int) (err error) {
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("starting transaction: %w", err)
	}

	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	if _, err = tx.Exec("UPDATE accounts SET balance = balance - $1 WHERE id = $2", amount, fromID); err != nil {
		return fmt.Errorf("debiting account: %w", err)
	}
	if _, err = tx.Exec("UPDATE accounts SET balance = balance + $1 WHERE id = $2", amount, toID); err != nil {
		return fmt.Errorf("crediting account: %w", err)
	}

	return nil
}
\`\`\`

Because \`err\` is a **named return value**, the deferred closure can read its final value after the function body runs (or after a \`return\`) and decide: rollback if something went wrong, commit if it didn't. This guarantees the transaction is always resolved, even if you add a new statement later and forget to handle its error path manually.

### Rolling back after commit is safe (and cheap)

Calling \`tx.Rollback()\` after a successful \`tx.Commit()\` is a documented no-op that returns \`sql.ErrTxDone\` — some codebases \`defer tx.Rollback()\` unconditionally right after \`Begin()\` as a safety net, accepting that harmless error on the success path.

### Wrapping errors with context

Notice every error above is wrapped with \`fmt.Errorf("...: %w", err)\`. The \`%w\` verb preserves the original error so callers can still use \`errors.Is\`/\`errors.As\`, while adding a human-readable breadcrumb about *where* it happened:

\`\`\`go
if err := transfer(db, 1, 2, 500); err != nil {
	log.Printf("transfer failed: %v", err)
	// transfer failed: crediting account: pq: insufficient balance
}
\`\`\`

> **Key idea:** Wrap every statement in a transaction when multiple writes must succeed or fail together, and use the named-return-plus-defer pattern so a forgotten error check can never leave a transaction hanging open.`,
    },
    {
      name: "ORMs and Migrations",
      minutes: 9,
      intro: "Know when to reach for a tool instead of raw SQL — and how schema changes travel with your code.",
      content: `## Raw SQL vs ORM vs query builder

\`database/sql\` gives you full control, but writing \`Scan(&a, &b, &c, ...)\` for every query gets repetitive as an app grows. Go's ecosystem offers a few common escape hatches.

| Approach | What it gives you | Trade-off |
|----------|--------------------|-----------|
| \`database/sql\` directly | Full control, zero magic, smallest dependency footprint | You write every \`Scan\` call by hand |
| **sqlc** | Generates typed Go functions from SQL you write | You still write SQL, but boilerplate is generated |
| **GORM** | Full ORM — struct-to-table mapping, associations, hooks | Less SQL to write, but harder to reason about generated queries |

### When database/sql alone is the right call

- Small services with a handful of queries
- Performance-sensitive paths where you want to see exactly what SQL runs
- Teams that already know SQL well and don't want an abstraction hiding it

\`\`\`go
// plain database/sql — nothing hidden
rows, _ := db.Query("SELECT id, title FROM tasks WHERE done = $1", false)
\`\`\`

### When an ORM or query builder earns its keep

- Larger apps with many tables and relationships (users, posts, comments, tags...)
- Teams that want compile-time-checked query results instead of hand-written \`Scan\` calls
- Rapid CRUD scaffolding where hand-writing every query is pure toil

A quick taste of GORM for comparison:

\`\`\`go
type Task struct {
	ID    uint
	Title string
	Done  bool
}

var tasks []Task
db.Where("done = ?", false).Find(&tasks)
\`\`\`

sqlc takes a different approach — you write the actual SQL, and it generates a typed Go function for it at build time, so you get compile-time safety without hiding the query:

\`\`\`sql
-- query: ListOpenTasks :many
SELECT id, title FROM tasks WHERE done = false;
\`\`\`

\`\`\`go
tasks, err := queries.ListOpenTasks(ctx)  // generated, fully typed
\`\`\`

There's no universally "correct" choice — it's a trade-off between control and velocity that depends on team size and how much the schema is expected to change.

### Schema migrations

However you talk to the database, its **schema** (tables, columns, indexes) needs to evolve alongside your code, in a way that's tracked and repeatable. \`golang-migrate\` is a popular tool for this: each change is a pair of numbered SQL files.

\`\`\`bash
migrate create -ext sql -dir migrations -seq add_users_table
# creates:
#   migrations/000001_add_users_table.up.sql
#   migrations/000001_add_users_table.down.sql
\`\`\`

\`\`\`sql
-- 000001_add_users_table.up.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);
\`\`\`

\`\`\`sql
-- 000001_add_users_table.down.sql
DROP TABLE users;
\`\`\`

Applying and reverting are single commands, and the tool tracks which migrations have already run in a bookkeeping table:

\`\`\`bash
migrate -path migrations -database "$DATABASE_URL" up
migrate -path migrations -database "$DATABASE_URL" down 1
\`\`\`

Every environment — a teammate's laptop, staging, production — runs the same numbered migrations in the same order, so the schema never drifts out of sync with the code that expects it.

> **Key idea:** Start with \`database/sql\` until its boilerplate genuinely hurts, then reach for sqlc (typed SQL) or an ORM like GORM (less SQL, more magic) — and manage schema changes as versioned, reversible migration files rather than manual \`ALTER TABLE\` commands run by hand.`,
    },
  ],
}
