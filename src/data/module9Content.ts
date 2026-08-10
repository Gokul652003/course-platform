import type { Module } from "../types"

export const module9: Module = {
  id: 9,
  title: "Bash Scripting",
  status: "upcoming",
  lessons: [
    {
      name: "Variables",
      minutes: 8,
      intro: "Store and reuse data in your Bash scripts with variables.",
      content: `## Variables

Variables let you store a value once and use it many times. In Bash they are simple strings until you tell Bash otherwise.

### Assign and read

Assign without spaces around the equals sign, and read with a leading dollar:

\`\`\`bash
greeting="hello"
name="gokul"
echo "$greeting, $name"
\`\`\`

Output:

\`\`\`bash
hello, gokul
\`\`\`

### Rule of thumb for a space

\`\`\`bash
name = "gokul"   # broken: spaces make it a command
name="gokul"     # correct
\`\`\`

### Command substitution

Capture a command's output into a variable with $(...):

\`\`\`bash
date=$(date)
echo "Today: $date"
\`\`\`

### Environment vs local

- The names a script gets from the caller are environment variables such as $HOME and $PATH
- Variables you set inside a script are local unless you export them

\`\`\`bash
export MY_BANNER="high five"
\`\`\`

> **Pro tip:** Always quote variable expansions: \`"$var"\`. Unquoted expansions split on spaces and can break when the value contains an empty field.

### Read-only guard it

\`\`\`bash
readonly pi=3.14
\`\`\`

### Practical example

\`\`\`bash
#!/usr/bin/env bash
user="gokul"
dir="/srv/data"
echo "hello $user, your dir is $dir"
\`\`\`

### Key recap

- Assign with \`name="value"\` and read with \`$name\`
- Use $(...) to store command output in a variable
- \`export\` makes a variable visible to child processes
- Quote \`"$var"\` to keep multi-word values intact`,
    },
    {
      name: "Conditions",
      minutes: 9,
      intro: "Control the flow of your script with if, test, and else.",
      content: `## Conditions

Scripts need to make decisions. The if statement checks a condition and runs one branch or another.

### Basic if

\`\`\`bash
if [ -f /etc/hosts ]; then
  echo "hosts file exists"
fi
\`\`\`

### if else

\`\`\`bash
if [ "$name" = "gokul" ]; then
  echo "hi gokul"
else
  echo "unknown user"
fi
\`\`\`

### Testing many things

Use brackets or the more readable double brackets:

- \`[ -f file ]\` file exists and is a regular file
- \`[ -d dir ]\` directory exists
- \`[ -e path ]\` path exists
- \`[ "$a" = "$b" ]\` string equality
- \`[ "$x" -gt 5 ]\` numeric: greater than
- \`[ -z "$var" ]\` string is empty

### elif chain

\`\`\`bash
if [ "$score" -ge 90 ]; then
  echo "grade A"
elif [ "$score" -ge 80 ]; then
  echo "grade B"
else
  echo "try again"
fi
\`\`\`

### Combining tests

Use && and || to join conditions inside brackets:

\`\`\`bash
if [ -f "$cfg" ] && [ -r "$cfg" ]; then
  echo "config readable"
fi
\`\`\`

> **Key idea:** There must be spaces inside the brackets. \`[ "$a"="$b" ]\` is one token and breaks; write \`[ "$a" = "$b" ]\`.

### Empty test trick

Check that a variable is set and not empty:

\`\`\`bash
if [ -z "$flag" ]; then
  echo "no flag given"
fi
\`\`\`

### Key recap

- \`if\` uses \`[\` condition \`]\` or \`[[ ]]\` brackets
- \`-f\`, \`-d\`, \`-z\`, \`-eq\` and friends test files, dirs, emptiness, and numbers
- \`elif\` lets you chain several branches
- Always space out tokens inside the brackets`,
    },
    {
      name: "Loops",
      minutes: 8,
      intro: "Repeat work automatically with for and while loops.",
      content: `## Loops

Loops let a script repeat work over a list or while a condition holds. They are the engine of automation.

### A simple for loop

\`\`\`bash
for i in 1 2 3; do
  echo "number: $i"
done
\`\`\`

Output:

\`\`\`bash
number: 1
number: 2
number: 3
\`\`\`

### Looping over files

\`\`\`bash
for file in *.txt; do
  echo "processing $file"
done
\`\`\`

### While loop

Runs while a condition is true:

\`\`\`bash
count=0
while [ $count -lt 5 ]; do
  echo "count is $count"
  count=$((count + 1))
done
\`\`\`

### Read lines from a file

\`\`\`bash
while read -r line; do
  echo "got: $line"
done < data.txt
\`\`\`

### Break and continue

- \`break\` exits the loop immediately
- \`continue\` skips to the next iteration

\`\`\`bash
for i in 1 2 3 4 5; do
  if [ $i -eq 3 ]; then
    continue
  fi
  echo $i
done
\`\`\`

Output:

\`\`\`bash
1
2
4
5
\`\`\`

> **Pro tip:** For a numeric range, use brace expansion or an explicit list: \`{1..5}\` keeps the loop short and readable.

### Key recap

- \`for x in list; do ... done\` iterates over items
- \`while [ cond ]; do ... done\` repeats while a condition holds
- \`break\` ends the loop; \`continue\` skips the current iteration
- \`read -r line\` inside a while loop is the standard way to stream a file`,
    },
    {
      name: "Functions",
      minutes: 8,
      intro: "Wrap repeated logic into reusable chunks with Bash functions.",
      content: `## Functions

Functions group commands under a name so you can reuse a behavior without copying the block.

### Defining a function

\`\`\`bash
greet() {
  echo "hello $1"
}
\`\`\`

### Calling the function

\`\`\`bash
greet gokul
\`\`\`

Output:

\`\`\`bash
hello gokul
\`\`\`

### Inside the function

- $1, $2 are the arguments passed to the function
- $# is the count of arguments
- Variables are global unless you scope them with \`local\`

\`\`\`bash
adder() {
  local total
  total=$(( $1 + $2 ))
  echo "$total"
}
\`\`\`

### Return values

Bash returns exit codes, not data. Use echo for data and return for the status:

\`\`\`bash
is_even() {
  if [ $(( $1 % 2 )) -eq 0 ]; then
    return 0
  fi
  return 1
}
\`\`\`

### Capture a function's output

\`\`\`bash
sum=$(adder 3 4)
echo "sum is $sum"
\`\`\`

> **Key idea:** Prefer \`local\` for any variable inside a function. Otherwise it leaks into the global scope and can overwrite the caller's values.

### Sourcing a library

Put functions in a separate file and load them in:

\`\`\`bash
source ./helpers.sh
\`\`\`

### Key recap

- Define with \`name() { ... }\` and call it by name
- Use $1, $2, and $# to read arguments
- Use \`return\` for status and \`echo\` for returning data
- Scope internal variables with \`local\` to avoid leaks`,
    },
    {
      name: "Arrays",
      minutes: 8,
      intro: "Store lists of values in Bash arrays and iterate over them.",
      content: `## Arrays

Arrays hold ordered lists of values. They are ideal for a set of files, hosts, or tasks.

### Creating an array

\`\`\`bash
fruits=(apple banana cherry)
\`\`\`

### Access one element

Indexes start at 0:

\`\`\`bash
echo "\${fruits[0]}"
\`\`\`

### All elements

\`\`\`bash
echo "all: \${fruits[@]}"
\`\`\`

> **Key idea:** Inside the array expansion, write \`"\${fruits[@]}"\` for the full list. The quoted expansion keeps values with spaces intact.

### Loop over an array

\`\`\`bash
for f in "\${arch[@]}"; do
  echo "arch: $f"
done
\`\`\`

### Count elements

\`\`\`bash
echo "count: \${#arch[@]}"
\`\`\`

### Append an element

\`\`\`bash
arch+=(debian)
\`\`\`

### Iterate a split string

Turn a delimited string into items:

\`\`\`bash
list="one two three"
for word in $list; do
  echo "$word"
done
\`\`\`

Output:

\`\`\`bash
one
two
three
\`\`\`

> **Pro tip:** Use \`read -a\` to fill an array from an input line: \`read -ra parts <<< "a b c"\`.

### Key recap

- Declare with \`(value1 value2 ...)\` and index from 0
- \`"\${arr[@]}"\` expands every element; \`"\${#arr[@]}"\` gives the count
- Use \`arr+=(x)\` to append
- Loops over arrays are the cleanest way to apply one action to many items`,
    },
    {
      name: "Arguments",
      minutes: 8,
      intro: "Read command-line arguments so your script accepts input at run time.",
      content: `## Arguments

Scripts become useful once they accept parameters from the command line. Bash hands you these through special variables.

### The special variables

- $# the number of arguments
- $0 the script's name
- $1, $2, ... each positional argument in order
- $@ all arguments as a list
- $* all arguments as one string

### Reading one argument

\`\`\`bash
#!/usr/bin/env bash
echo "script: $0"
echo "first:  $1"
echo "second: $2"
echo "count:  $#"
\`\`\`

Run it:

\`\`\`bash
./demo.sh hello world
\`\`\`

Output:

\`\`\`bash
script: ./demo.sh
first:  hello
second: world
count:  2
\`\`\`

### Shift to move through the list

\`\`\`bash
while [ $# -gt 0 ]; do
  echo "arg: $1"
  shift
done
\`\`\`

### Check for a minimum

\`\`\`bash
if [ $# -lt 1 ]; then
  echo "expected at least 1 argument"
  exit 1
fi
\`\`\`

> **Key idea:** Use $@ in a quoted loop over the arguments: \`for arg in "$@"; do\`. This keeps every argument intact even when it contains spaces.

### Parameter defaults

Use a pattern to supply a default value:

\`\`\`bash
name="\${1:-user}"
\`\`\`

That yields the literal text \`user\` when there is no argument.

### Key recap

- $0 is the script name; $1, $2, ... are positionals; $# is the count
- Loop over arguments with \`for arg in "$@"\` to preserve spaces
- \`shift\` walks through each argument one at a time
- Use \`"\${1:-default}"\` to fall back when an argument is missing`,
    },
    {
      name: "Exit codes",
      minutes: 7,
      intro: "Signal success or failure from your scripts using exit codes.",
      content: `## Exit codes

Every command returns an exit status when it finishes. Bash scripts use these to decide what happens next.

### The status variable

The status of the last command sits in $?:

\`\`\`bash
ls /etc/hosts
echo "status was $?"
\`\`\`

> **Key idea:** Exit code 0 means success. Any non-zero value signals one kind of failure. Convention: 1 for generic error, 2 for a bad usage, others for specific causes.

### 0 means success

\`\`\`bash
if grep "root" /etc/passwd > /dev/null; then
  echo "found root user"
fi
\`\`\`

### Setting your own exit

Use the built-in exit command:

\`\`\`bash
if [ ! -f "$cfg" ]; then
  echo "no config"
  exit 1
fi
\`\`\`

### Exit as soon as a command fails

\`set -e\` makes the script stop on its first failing command:

\`\`\`bash
#!/usr/bin/env bash
set -e
command1
command2
\`\`\`

\`set -u\` makes an unset variable an error too:

\`\`\`bash
set -u
\`\`\`

### Short-circuit with or

Run a fallback when a command fails:

\`\`\`bash
cd /some/dir || exit 1
\`\`\`

> **Pro tip:** Combine \`set -euo pipefail\` at the top of a script; it surfaces mistakes that would otherwise be silently ignored.

### Default exit

If a script ends without an \`exit\`, its exit status is the status of the last command.

### Key recap

- 0 is success, anything non-zero is a failure
- Check the last command's status with $?
- Use \`exit N\` to set the script's own exit code
- \`set -e\`, \`set -u\`, and \`|| exit 1\` catch failures early`,
    },
    {
      name: "Input/output",
      minutes: 8,
      intro: "Direct, filter, and connect data using stdin, stdout, and stderr.",
      content: `## Input/output

Every command streams data through three standard channels: stdin, stdout, and stderr. Redirecting them gives you enormous control.

### The three streams

- **stdin** (0) input the command reads
- **stdout** (1) normal output
- **stderr** (2) error messages

### Redirect stdout to a file

\`\`\`bash
ls -l > listing.txt
\`\`\`

### Append instead of overwrite

\`\`\`bash
echo "extra line" >> listing.txt
\`\`\`

### Redirect stderr

\`\`\`bash
command 2> errors.txt
\`\`\`

### Send stderr to stdout

\`\`\`bash
command > all.txt 2>&1
\`\`\`

### Read from an input file

\`\`\`bash
sort < numbers.txt
\`\`\`

### Pipe one command to the next

\`\`\`bash
cat data.txt | grep error | wc -l
\`\`\`

> **Key idea:** A pipe connects one command's stdout to the next command's stdin. The shell sets that up for you as part of the pipeline.

### Discard output you do not want

\`\`\`bash
grep -r password . 2> /dev/null
\`\`\`

Sending a stream to \`/dev/null\` drops it entirely.

> **Pro tip:** Capture both channels for a log with \`2>&1\` and write them to the same file.

### Redirection table

- \`>\` overwrite stdout
- \`>>\` append stdout
- \`2>\` redirect stderr
- \`2>&1\` merge stderr into stdout
- \`<\` read stdin from a file

### Key recap

- stdin, stdout, and stderr are the three standard data channels
- Use \`>\` and \`>>\` to write or append stdout
- Redirect stderr with \`2>\` and merge it with \`2>&1\`
- Pipes with \`|\` feed one command's output into the next`,
    },
    {
      name: "Automation scripts",
      minutes: 10,
      intro: "Combine everything into robust scripts that run unattended.",
      content: `## Automation scripts

A useful script is more than a handful of commands. It should fail loudly, guard inputs, log clear messages, and run well unattended.

### Set strict mode

Add these at the top of a script:

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail
\`\`\`

This stops on errors, unset variables, and pipe failures.

### A real backup example

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail
dir="$1"
stamp=$(date +%Y%m%d)
tar -czf "backup-$stamp.tar.gz" "$dir"
echo "backup written"
\`\`\`

> **Key idea:** Always clear \`set -euo pipefail\` first so one early problem does not let the script limp on with broken results.

### Roll a timestamp onto every run

\`\`\`bash
log="run-$(date +%H%M).log"
echo "starting $log" >> "$log"
\`\`\`

### Guard the wrong input

\`\`\`bash
if [ $# -ne 1 ]; then
  echo "usage: $0 dir" >&2
  exit 1
fi
\`\`\`

### Trap signals for cleanup

\`\`\`bash
trap 'echo "interrupted"' INT
\`\`\`

### Read a config inside your script

\`\`\`bash
file="$HOME/config.cfg"
[ -f "$file" ] && . "$file"
\`\`\`

> **Pro tip:** Keep the script's final output short: one line of truth to log and one to screen so you can diff runs later.

### Key recap

- Start every automation with \`set -euo pipefail\`
- Guard arguments and validate inputs at the top
- Add timestamps to logs and backup files
- Use \`trap\` to clean up on a controlled stop`,
    },
    {
      name: "Cron jobs",
      minutes: 10,
      intro: "Schedule your scripts to run automatically with cron and crontab.",
      content: `## Cron jobs

Cron runs commands on a defined schedule. It is the classic way to automate backups, logs, and maintenance.

### See your schedule

\`\`\`bash
crontab -l
\`\`\`

### Edit your schedule

\`\`\`bash
crontab -e
\`\`\`

### The five fields

\`\`\`bash
* * * * *  command
| | | | |
| | | | +--- day of the week (0-6)
| | | +----- month (1-12)
| | +------- day of the month (1-31)
| +--------- hour (0-23)
+----------- minute (0-59)
\`\`\`

### Common examples

Every minute:

\`\`\`bash
* * * * * echo "tick" >> /tmp/tick.log
\`\`\`

Daily at 4:30 AM:

\`\`\`bash
30 4 * * * /usr/local/bin/backup.sh
\`\`\`

Every Monday at 9 AM:

\`\`\`bash
0 9 * * 1 /usr/local/bin/weekly.sh
\`\`\`

> **Key idea:** Cron gives your job a minimal environment. It does not use your interactive PATH, so reference scripts by absolute path and redirect output to a log file.

### Logging the run

Redirect output so problems are visible:

\`\`\`bash
30 4 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
\`\`\`

### View a user's schedule

\`\`\`bash
crontab -l -u gokul
\`\`\`

### Using @ shorthand

\`\`\`bash
@daily /usr/local/bin/daily.sh
@reboot /usr/local/bin/startup.sh
\`\`\`

> **Pro tip:** Always test your script by hand before adding it to cron. If it works interactively but fails in cron, the environment (PATH, shell) is the usual suspect.

### Remove a schedule

\`\`\`bash
crontab -r
\`\`\`

### Key recap

- Cron fields are minute, hour, day-of-month, month, day-of-week
- Use \`crontab -e\` to edit and \`crontab -l\` to list your jobs
- Use \`@daily\` and \`@reboot\` shortcuts and redirect output to a log
- In cron, reference scripts by absolute path and test interactively first`,
    },
  ],
};