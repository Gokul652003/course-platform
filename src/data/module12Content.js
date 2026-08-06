export const module12 = {
  id: 12,
  title: "Linux for Developers & DevOps",
  status: "upcoming",
  lessons: [
    {
      name: "Git on Linux",
      minutes: 10,
      intro:
        "Install Git, configure your identity, and make your first commits from the terminal.",
      content: `## Git on Linux

Git is the version control system almost every developer uses. It tracks changes, keeps history, and enables teamwork.

### Install Git

On Debian/Ubuntu:

\`\`\`bash
sudo apt update
sudo apt install -y git
git --version
\`\`\`

Example output:

\`\`\`
git version 2.43.0
\`\`\`

### Configure your identity

\`\`\`bash
git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"
\`\`\`

These settings are stored in \`~/.gitconfig\` and stamped on every commit you create.

### Start a repository

\`\`\`bash
mkdir myapp && cd myapp
git init
echo "node_modules/" > .gitignore
git status
\`\`\`

\`git status\` shows untracked files and which changes are staged. The classic workflow:

\`\`\`bash
git add .
git commit -m "Initial commit"
git log --oneline
\`\`\`

### Clone an existing project

\`\`\`bash
git clone https://github.com/example/project.git
cd project
\`\`\`

> **Key idea:** A commit is a snapshot. \`git add\` stages changes, \`git commit\` saves them, and \`git log\` shows the history. Practice this loop and everything else becomes easier.

### Work with remotes

\`\`\`bash
git remote -v
git push origin main
git pull origin main
\`\`\`

### Key recap

- Git records snapshots via \`git add\` and \`git commit\`.
- Configure \`user.name\` and \`user.email\` once — commits need an identity.
- \`git clone\`, \`git pull\`, and \`git push\` move code between local and remote.
- \`git status\` and \`git log\` are your daily windows into the repo state.`,
    },
    {
      name: "Docker",
      minutes: 9,
      intro:
        "Run applications in isolated containers so they behave the same on every machine.",
      content: `## Docker

Docker packages an application and its dependencies into a **container** — an isolated process that runs anywhere Linux runs.

### Install Docker

\`\`\`bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
docker --version
\`\`\`

Add your user to the docker group so you don't need \`sudo\` every time:

\`\`\`bash
sudo usermod -aG docker $USER
newgrp docker
\`\`\`

### Run your first container

\`\`\`bash
docker run -d -p 8080:80 --name web nginx
docker ps
\`\`\`

- \`-d\` runs it detached (in the background)
- \`-p 8080:80\` maps host port 8080 to container port 80
- \`nginx\` is the image pulled from Docker Hub

Example output:

\`\`\`
CONTAINER ID   IMAGE   COMMAND   PORTS                  NAMES
a1b2c3d4e5f6   nginx   ...       0.0.0.0:8080->80/tcp   web
\`\`\`

Open \`http://localhost:8080\` and you should see the nginx welcome page.

### Manage containers

\`\`\`bash
docker stop web
docker start web
docker rm web
docker images
docker image rm nginx
\`\`\`

> **Pro tip:** \`docker ps\` shows only running containers. Add \`-a\` to see everything, including stopped ones: \`docker ps -a\`.

### Key recap

- \`docker run\` starts a container from an image with flags like \`-d\`, \`-p\`, and \`--name\`.
- \`docker ps\` lists running containers; \`docker ps -a\` shows all.
- Containers are disposable — \`docker rm\` deletes one cleanly.
- Mapping ports with \`-p\` is what makes a container reachable from your machine.`,
    },
    {
      name: "Docker Compose",
      minutes: 9,
      intro:
        "Define multi-container apps in one YAML file and manage them with simple commands.",
      content: `## Docker Compose

Single commands get messy fast once an app needs a database, a cache, and an API. Compose defines everything in one file.

### A compose file

\`\`\`yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
\`\`\`

Save this as \`docker-compose.yml\` and start everything:

\`\`\`bash
docker compose up -d
\`\`\`

\`-d\` runs it detached. Compose pulls images, creates a network, and starts both services.

### Inspect the stack

\`\`\`bash
docker compose ps
docker compose logs -f web
docker compose exec db psql -U postgres
\`\`\`

- \`ps\` shows the status of every service
- \`logs\` streams service logs, \`-f\` follows them live
- \`exec\` runs a command inside a running container

### Tear it down

\`\`\`bash
docker compose down
docker compose down -v
\`\`\`

The \`-v\` flag also deletes named volumes — a great way to reset the database.

> **Key idea:** Compose treats your whole app as one unit. \`up\`, \`ps\`, \`logs\`, and \`down\` replace dozens of \`docker run\` calls, and the YAML file is versionable alongside your code.

### Key recap

- \`docker-compose.yml\` declares services, ports, env vars, and volumes in one place.
- \`docker compose up -d\` starts the stack; \`docker compose down\` stops it.
- \`docker compose exec\` and \`logs -f\` help you debug running services.
- Named volumes persist data across container restarts.`,
    },
    {
      name: "Nginx",
      minutes: 10,
      intro:
        "Serve static files and proxy requests with the most widely used web server.",
      content: `## Nginx

Nginx is a fast web server and reverse proxy — it can serve your static site and forward API traffic to your application.

### Install and start

\`\`\`bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable --now nginx
sudo systemctl status nginx
\`\`\`

Example output:

\`\`\`
● nginx.service - A high performance web server
     Active: active (running)
\`\`\`

### Serve a static site

Site configs live in \`/etc/nginx/sites-available/\` and are linked into \`sites-enabled/\`:

\`\`\`bash
sudo nano /etc/nginx/sites-available/mysite
\`\`\`

\`\`\`nginx
server {
    listen 80;
    server_name mysite.example;

    root /var/www/mysite;
    index index.html;
}
\`\`\`

Enable it and reload:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

\`nginx -t\` checks your config for syntax errors before you apply it.

### Useful commands

\`\`\`bash
sudo journalctl -u nginx -f
curl -I http://localhost
\`\`\`

> **Pro tip:** Always run \`sudo nginx -t\` before reloading. A bad config can take your whole site down — the test catches typos first.

### Key recap

- Nginx serves static files from \`root\` and proxies dynamic traffic with \`proxy_pass\`.
- Configs live in \`sites-available\` and get symlinked into \`sites-enabled\`.
- \`systemctl reload\` applies changes without downtime.
- \`nginx -t\` validates config before you reload.`,
    },
    {
      name: "Caddy",
      minutes: 8,
      intro:
        "A simpler web server that configures HTTPS automatically for you.",
      content: `## Caddy

Caddy is a web server focused on simplicity. Its killer feature: **automatic HTTPS** via Let's Encrypt with zero extra setup.

### Install Caddy

\`\`\`bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
\`\`\`

### The Caddyfile

\`/etc/caddy/Caddyfile\`:

\`\`\`caddy
mysite.example {
    root * /var/www/mysite
    file_server
}
\`\`\`

A reverse proxy for your app is just two lines:

\`\`\`caddy
api.example {
    reverse_proxy localhost:3000
}
\`\`\`

### Run and reload

\`\`\`bash
sudo systemctl reload caddy
sudo journalctl -u caddy -f
\`\`\`

When the domain resolves to your server, Caddy obtains a certificate automatically — no certbot, no manual renewal.

> **Key idea:** With Nginx you manage certs yourself; with Caddy the HTTPS dance is automatic. If your goal is getting a site live fast, Caddy is the path of least resistance.

### Key recap

- Caddy's Caddyfile is tiny compared to Nginx configs.
- \`reverse_proxy localhost:3000\` forwards traffic to your app.
- HTTPS certificates are requested and renewed automatically.
- \`caddy\` reloads config with \`systemctl reload\`.`,
    },
    {
      name: "SSH keys",
      minutes: 9,
      intro:
        "Generate key pairs and log in to servers without typing a password.",
      content: `## SSH keys

Password logins are weak and annoying. SSH key pairs give you strong, passwordless authentication.

### Generate a key pair

\`\`\`bash
ssh-keygen -t ed25519 -C "gokul@laptop"
\`\`\`

Example output:

\`\`\`
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/gokul/.ssh/id_ed25519):
\`\`\`

This creates two files in \`~/.ssh/\`:

- \`id_ed25519\` — your **private key** (never share it)
- \`id_ed25519.pub\` — your **public key** (safe to share)

### Copy the key to a server

\`\`\`bash
ssh-copy-id user@server.example
ssh user@server.example
\`\`\`

\`ssh-copy-id\` appends your public key to \`~/.ssh/authorized_keys\` on the server. From then on, SSH asks for no password.

### Key permissions matter

\`\`\`bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
\`\`\`

SSH refuses to use a private key with loose permissions.

> **Warning:** Never copy your private key anywhere. If it leaks, anyone can impersonate you on every server that trusts it. Treat it like a password, and add a passphrase when generating.

### Verify your keys

\`\`\`bash
ls ~/.ssh
cat ~/.ssh/id_ed25519.pub
\`\`\`

### Key recap

- \`ssh-keygen -t ed25519\` creates a modern, secure key pair.
- \`ssh-copy-id\` installs your public key on a server.
- Protect \`~/.ssh\` with \`chmod 700\` and keys with \`chmod 600\`.
- Your private key stays local; only the public key goes to servers.`,
    },
    {
      name: "System logs",
      minutes: 9,
      intro:
        "Read journald logs to find out exactly what your services are doing.",
      content: `## System logs

Every service on Linux writes logs. Knowing how to read them turns mystery crashes into quick fixes.

### systemd's journal

On modern distros, logs live in the systemd journal:

\`\`\`bash
journalctl
journalctl -b
journalctl -u nginx
\`\`\`

- \`journalctl\` shows everything since boot
- \`-b\` restricts to the current boot
- \`-u nginx\` filters to one service

### Follow logs live

\`\`\`bash
journalctl -u nginx -f
\`\`\`

\`-f\` tails new lines as they arrive — perfect while reloading a config or debugging a request.

### Classic file logs

Some software still writes to \`/var/log\`:

\`\`\`bash
ls /var/log
sudo tail -f /var/log/syslog
sudo cat /var/log/auth.log
\`\`\`

\`auth.log\` records SSH logins — check it if you suspect a brute-force attack.

### Search the log

\`\`\`bash
journalctl -u nginx --since "1 hour ago"
journalctl -u app | grep -i error
\`\`\`

> **Pro tip:** Pair a filter with \`-f\` and \`--since\` to see only the relevant window. \`journalctl -u app -f\` is the fastest way to watch your application's output.

### Key recap

- \`journalctl -u service\` shows one service's logs.
- \`-f\` follows logs in real time.
- \`/var/log/auth.log\` and \`/var/log/syslog\` remain important on older software.
- Grep and \`--since\` narrow huge logs down to what matters.`,
    },
    {
      name: "Environment variables",
      minutes: 8,
      intro:
        "Configure your applications and shell without touching source code.",
      content: `## Environment variables

Environment variables pass configuration to programs — database URLs, API keys, and settings — without hardcoding them.

### View variables

\`\`\`bash
printenv
echo $PATH
echo $HOME
\`\`\`

Example output:

\`\`\`
/home/gokul
\`\`\`

### Set a variable for one command

\`\`\`bash
NODE_ENV=production npm start
\`\`\`

The variable exists only for that process and its children.

### Export to a shell session

\`\`\`bash
export DATABASE_URL="postgres://app:secret@localhost/app"
\`\`\`

Make it permanent by appending to \`~/.bashrc\`:

\`\`\`bash
echo 'export DATABASE_URL="postgres://app:secret@localhost/app"' >> ~/.bashrc
source ~/.bashrc
\`\`\`

### Configuration best practices

- Keep secrets in a \`.env\` file, never in the repository
- Load \`.env\` with \`set -a; source .env; set +a\`
- Reference \`$VAR\` in your app code, not literal values

> **Key idea:** Configuration should be injectable. When the same container runs in staging and production, environment variables are how it knows which database and which secrets to use.

### Key recap

- \`printenv\` and \`echo $VAR\` inspect the current environment.
- \`export VAR=value\` sets a variable for child processes.
- \`~/.bashrc\` + \`source\` make variables persistent.
- Never commit secrets — use \`.env\` and inject via environment.`,
    },
    {
      name: "Node.js installation",
      minutes: 9,
      intro:
        "Install Node.js and npm on Linux for modern JavaScript development.",
      content: `## Node.js installation

Node.js runs JavaScript outside the browser and ships with npm, the package manager.

### Install from NodeSource

The distro packages are often old. NodeSource provides current releases:

\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
\`\`\`

Example output:

\`\`\`
v20.15.0
10.7.0
\`\`\`

### Manage versions with nvm

To switch between Node versions, use nvm:

\`\`\`bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
nvm ls
\`\`\`

nvm keeps each version in \`~/.nvm\` and lets you jump between them freely.

### Your first project

\`\`\`bash
mkdir app && cd app
npm init -y
npm install express
node -e "console.log('hello node')"
\`\`\`

> **Pro tip:** Use nvm for development — it gives you a version manager plus painless upgrades. On production servers, install one pinned Node version directly so every machine is identical.

### Key recap

- NodeSource installs current Node with one script + \`apt install nodejs\`.
- nvm manages multiple Node versions for development.
- \`node --version\` and \`npm --version\` confirm the install.
- \`npm init\` + \`npm install\` start a new project.`,
    },
    {
      name: "Go installation",
      minutes: 9,
      intro:
        "Install the Go toolchain from the official tarball and build your first binary.",
      content: `## Go installation

Go compiles to a single static binary, which makes it a favorite for CLI tools and servers on Linux.

### Download the official tarball

Grab the latest version from go.dev, then:

\`\`\`bash
cd /tmp
wget https://go.dev/dl/go1.22.4.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz
\`\`\`

This extracts Go to \`/usr/local/go\`.

### Add Go to PATH

\`\`\`bash
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
go version
\`\`\`

Example output:

\`\`\`
go version go1.22.4 linux/amd64
\`\`\`

### Verify the install

\`\`\`bash
go env GOPATH
which go
\`\`\`

\`GOPATH\` defaults to \`~/go\` where modules and binaries are cached.

### Build something

\`\`\`bash
mkdir -p ~/src/hello && cd ~/src/hello
go mod init hello
printf 'package main\nimport "fmt"\nfunc main() { fmt.Println("hi") }\n' > main.go
go run .
go build -o hello .
\`\`\`

> **Pro tip:** If you hit \`go: command not found\`, you forgot the PATH step. The \`$PATH:/usr/local/go/bin\` export must be reloaded with \`source ~/.bashrc\` in every open terminal.

### Key recap

- Extract the Go tarball into \`/usr/local\` for a system-wide install.
- Add \`/usr/local/go/bin\` to \`PATH\` in \`~/.bashrc\`.
- \`go version\` and \`go env GOPATH\` confirm everything works.
- \`go build\` produces a single self-contained binary.`,
    },
    {
      name: "Java installation",
      minutes: 9,
      intro:
        "Install a modern OpenJDK, then point JAVA_HOME at it for build tools.",
      content: `## Java installation

Java powers Spring Boot apps, Gradle builds, and countless enterprise services. Install a modern OpenJDK to get started.

### Install OpenJDK

\`\`\`bash
sudo apt update
sudo apt install -y openjdk-21-jdk
java -version
\`\`\`

Example output:

\`\`\`
openjdk version "21.0.2" 2024-01-16
OpenJDK Runtime Environment (build 21.0.2+13-Ubuntu)
\`\`\`

### Which Java is active?

If several versions are installed, \`update-alternatives\` picks the default:

\`\`\`bash
update-alternatives --config java
command -v java
\`\`\`

### Set JAVA_HOME

Build tools like Maven and Gradle look for \`JAVA_HOME\`:

\`\`\`bash
sudo update-alternatives --list java
\`\`\`

Then set it:

\`\`\`bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
source ~/.bashrc
echo $JAVA_HOME
\`\`\`

### Quick test

\`\`\`bash
cat > Hello.java <<EOF
public class Hello {
  public static void main(String[] args) {
    System.out.println("java works");
  }
}
EOF
javac Hello.java
java Hello
\`\`\`

> **Pro tip:** \`JAVA_HOME\` mismatches are a classic source of build failures. Confirm it with \`echo $JAVA_HOME\` after every setup — Maven and Gradle refuse to cooperate if it points nowhere.

### Key recap

- \`openjdk-21-jdk\` installs the compiler (\`javac\`) and runtime (\`java\`).
- \`update-alternatives\` switches the default JDK.
- \`JAVA_HOME\` must point at the JDK directory for build tools.
- \`javac\` compiles; \`java\` runs the compiled class.`,
    },
    {
      name: "PostgreSQL",
      minutes: 10,
      intro:
        "Install, start, and create users and databases on PostgreSQL.",
      content: `## PostgreSQL

PostgreSQL is a battle-tested relational database and the default choice for most web applications.

### Install and start

\`\`\`bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
systemctl status postgresql
\`\`\`

Postgres installs with a superuser named \`postgres\`. Log in with:

\`\`\`bash
sudo -u postgres psql
\`\`\`

You'll see the \`postgres=#\` prompt.

### Create a database and user

\`\`\`sql
CREATE USER myapp WITH PASSWORD 'secret';
CREATE DATABASE myapp OWNER myapp;
GRANT ALL PRIVILEGES ON DATABASE myapp TO myapp;
\\q
\`\`\`

### Connect as your app user

\`\`\`bash
psql -h localhost -U myapp -d myapp -W
\`\`\`

Enter the password and you're in. Your connection string is:

\`\`\`
postgres://myapp:secret@localhost/myapp
\`\`\`

### Daily operations

\`\`\`bash
sudo systemctl restart postgresql
sudo -u postgres pg_dump myapp > backup.sql
sudo -u postgres psql -c '\\dt' myapp
\`\`\`

> **Warning:** The \`postgres\` superuser account has no password by default and uses peer authentication — only the OS user \`postgres\` can log in. Never expose port 5432 to the public internet without a firewall.

### Key recap

- \`postgresql\` package + \`systemctl enable --now\` gets you running.
- \`sudo -u postgres psql\` is your admin entry point.
- \`CREATE USER\` and \`CREATE DATABASE\` set up app access.
- \`pg_dump\` creates backups you can restore anywhere.`,
    },
    {
      name: "System monitoring",
      minutes: 10,
      intro:
        "Watch CPU, memory, disk, and network so you can diagnose a sick server.",
      content: `## System monitoring

Before you can fix a slow server, you must see what it's doing. These commands give you the full picture.

### CPU and memory in real time

\`\`\`bash
top
htop
\`\`\`

\`htop\` (install with \`sudo apt install htop\`) is friendlier: color-coded bars, sorted by usage, and F9 to kill a process.

### Memory

\`\`\`bash
free -h
\`\`\`

Example output:

\`\`\`
              total        used        free
Mem:           7.7Gi       3.1Gi       2.1Gi
Swap:          2.0Gi          0B       2.0Gi
\`\`\`

Watch the \`available\` column, not \`free\` — Linux caches files aggressively, so \`free\` looks low even when fine.

### Disk

\`\`\`bash
df -h
du -sh /var/log
\`\`\`

A full disk is the most common cause of mysterious app failures.

### Load and uptime

\`\`\`bash
uptime
\`\`\`

The load average (1/5/15 minutes) should stay well below the number of CPU cores.

> **Pro tip:** Build a habit loop — check \`htop\`, \`free -h\`, and \`df -h\` before debugging anything. It takes ten seconds and rules out the boring causes first.

### Network

\`\`\`bash
ss -tulpn
\`\`\`

Shows listening sockets, so you can confirm port 80 and 443 are bound.

### Key recap

- \`htop\` shows CPU and memory usage sorted by process.
- \`free -h\` and \`df -h\` reveal memory and disk pressure.
- \`uptime\` reports load average; keep it under your core count.
- \`ss -tulpn\` shows which ports are listening.`,
    },
    {
      name: "VPS deployment",
      minutes: 12,
      intro:
        "Take an app from your laptop to a hardened production server on a VPS.",
      content: `## VPS deployment

A VPS is a rented Linux server. Here is the minimal path from a fresh box to a running app.

### 1. SSH in as root

\`\`\`bash
ssh root@YOUR_SERVER_IP
\`\`\`

### 2. Update everything

\`\`\`bash
apt update && apt upgrade -y
\`\`\`

### 3. Create a non-root user

\`\`\`bash
adduser deploy
usermod -aG sudo deploy
\`\`\`

### 4. Copy your SSH key

From your laptop:

\`\`\`bash
ssh-copy-id deploy@YOUR_SERVER_IP
ssh deploy@YOUR_SERVER_IP
\`\`\`

### 5. Set up a firewall

\`\`\`bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
\`\`\`

### 6. Ship your app

The classic approach: git clone the repo, install dependencies, run the app under a systemd service.

\`\`\`bash
sudo systemctl enable --now myapp
systemctl status myapp
\`\`\`

> **Key idea:** Deploy in layers: bare system → hardened user + firewall → app + systemd service → reverse proxy on port 443. Each layer is small, testable, and reversible.

### Key recap

- Update the OS before touching anything else.
- Create a \`deploy\` user with sudo instead of working as root.
- Enable \`ufw\` and allow only SSH and web traffic.
- A systemd unit keeps your app running after reboots.`,
    },
    {
      name: "Reverse proxy",
      minutes: 9,
      intro:
        "Place one server in front of your apps to handle TLS, ports, and routing.",
      content: `## Reverse proxy

A reverse proxy sits in front of your application, accepting client requests and forwarding them onward. Nginx and Caddy are both great choices.

### Why use one

- **TLS termination** — the proxy handles HTTPS, your app stays plain HTTP
- **Clean ports** — clients use 80/443, apps bind to random high ports
- **Load balancing** — spread traffic across several backend instances
- **Central logging and security**

### How the flow looks

\`\`\`
Client
  │  https://api.example
  ▼
Nginx  (port 443, TLS)
  │  http://127.0.0.1:3000
  ▼
Node app  (localhost:3000)
\`\`\`

### Nginx proxy config

\`\`\`nginx
server {
    listen 443 ssl;
    server_name api.example;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
\`\`\`

Reload with \`sudo nginx -t && sudo systemctl reload nginx\`.

> **Pro tip:** Always pass \`Host\` and \`X-Forwarded-For\` headers. Frameworks use them to build URLs and log real client IPs — without them your app sees only the proxy.

### Key recap

- A reverse proxy fronts one or many backend apps.
- It terminates TLS and translates 80/443 to internal ports.
- \`proxy_pass\` in Nginx forwards requests to your app.
- Headers like \`Host\` and \`X-Forwarded-For\` keep the app aware of the real client.`,
    },
    {
      name: "File permissions in Docker",
      minutes: 10,
      intro:
        "Prevent permission headaches and root-inside-container surprises with UIDs.",
      content: `## File permissions in Docker

Docker containers run as \`root\` by default, and that causes nasty permission bugs with shared files.

### The default problem

\`\`\`bash
docker run --rm -v $PWD/data:/app/data alpine touch /app/data/hello.txt
ls -l data/hello.txt
\`\`\`

The file is owned by root (uid 0), so your host user can't delete it.

### Check what's inside

\`\`\`bash
docker run --rm alpine id
\`\`\`

Output: \`uid=0(root) gid=0(root)\`.

### Run as your host user

Match your host uid and gid:

\`\`\`bash
docker run --rm -u "$UID:$GID" -v "$PWD/data:/app/data" alpine touch /app/data/hello.txt
\`\`\`

Now the file belongs to your user. To verify, run \`id\` inside the container with \`-u "$UID:$GID"\`.

### Better: set it in the image

In the Dockerfile:

\`\`\`dockerfile
FROM node:20
RUN useradd -m appuser
USER appuser
\`\`\`

> **Pro tip:** Prefer the \`USER\` directive in your Dockerfile so the app never runs as root. For ad-hoc debugging, \`-u "$UID:$GID"\` makes bind-mounted files writeable by your host user.

### Key recap

- Containers default to uid 0 (root) — dangerous and permission-heavy.
- \`-u "$UID:$GID"\` maps container processes to your host user.
- The \`USER\` Dockerfile directive bakes non-root into the image.
- Bind mounts inherit host filesystem permissions — match UIDs to stay sane.`,
    },
    {
      name: "CI/CD basics",
      minutes: 11,
      intro:
        "Automate build, test, and deploy so every commit flows to production safely.",
      content: `## CI/CD basics

CI/CD means every code change is built, tested, and shipped automatically instead of by hand.

### The pipeline stages

\`\`\`
push to main
    │
    ▼
build ──► test ──► lint ──► deploy
\`\`\`

- **CI (Continuous Integration):** build and test every commit automatically
- **CD (Continuous Delivery/Deployment):** ship the tested artifact automatically

### A GitHub Actions example

\`.github/workflows/deploy.yml\`:

\`\`\`yaml
name: ci
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm ci && npm test
      - name: Deploy
        run: ssh deploy@server "git pull && systemctl restart app"
\`\`\`

Every push to \`main\` now runs tests, and only green builds deploy.

### Locally test the loop first

\`\`\`bash
npm test && npm run build
\`\`\`

> **Key idea:** CI/CD turns deployment from a scary manual ritual into a repeatable pipeline. If a change breaks production, it should be because a test passed that shouldn't have — not because a human missed a step.

### Key recap

- CI builds and tests every commit; CD ships the result automatically.
- Pipelines run on events like \`push\` to a branch.
- Secrets go in the CI provider's store, never in the repo.
- Start small: test, then deploy — add linting and staging later.`,
    },
    {
      name: "Performance tuning",
      minutes: 11,
      intro:
        "Raise limits, tune kernel parameters, and fix swap to get more from your server.",
      content: `## Performance tuning

Most slow servers are victims of default limits, not slow hardware. Fix those first.

### Raise file descriptor limits

Apps like PostgreSQL and web servers open thousands of files. Check yours:

\`\`\`bash
ulimit -n
\`\`\`

For a systemd service, raise it per-unit:

\`\`\`ini
[Service]
LimitNOFILE=65536
\`\`\`

Then \`sudo systemctl daemon-reload && sudo systemctl restart myapp\`.

### Tune swap

Swapping thrashes the disk and kills latency. Prefer to keep app code in RAM:

\`\`\`bash
cat /proc/sys/vm/swappiness
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swap.conf
sudo sysctl -p
\`\`\`

### Verify you're actually loaded

\`\`\`bash
uptime
free -h
\`\`\`

> **Pro tip:** Change one knob at a time, then re-run \`uptime\` and \`free -h\` to measure. If load average is still near the core count, the bottleneck is CPU — not limits.

### Common kernel tweaks

\`\`\`bash
echo 'net.core.somaxconn = 65535' | sudo tee -a /etc/sysctl.d/99-net.conf
sudo sysctl -p
\`\`\`

Raises the accept queue for high-traffic proxies and web servers.

### Key recap

- \`ulimit -n\` and \`LimitNOFILE\` control open-file limits.
- \`sysctl\` tunes kernel behavior like swappiness and socket queues.
- Measure with \`uptime\` and \`free -h\` before and after changes.
- One change at a time — you can't debug three tweaks at once.`,
    },
    {
      name: "Security best practices",
      minutes: 12,
      intro:
        "Harden SSH, automate updates, and firewall your box so attackers find nothing to exploit.",
      content: `## Security best practices

A default Linux install is convenient but not secure. These five changes close the most common holes.

### 1. Automate security updates

\`\`\`bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
\`\`\`

Patched vulnerabilities are the whole game — don't wait to apply them.

### 2. Harden SSH

\`/etc/ssh/sshd_config\`:

\`\`\`
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
\`\`\`

Apply changes:

\`\`\`bash
sudo systemctl restart ssh
\`\`\`

Keys only, no root login — brute force becomes pointless.

### 3. Block repeat offenders

\`\`\`bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
\`\`\`

fail2ban bans IPs after repeated failed logins.

### 4. Firewall everything

\`\`\`bash
sudo ufw default deny incoming
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
\`\`\`

### 5. Least privilege

\`\`\`bash
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
\`\`\`

> **Warning:** Test SSH key login in a *second* terminal before you set \`PasswordAuthentication no\`. Lock yourself out once and you'll learn that lesson the hard way.

### Key recap

- Keep the system patched with unattended-upgrades.
- Disable root login and password authentication over SSH.
- fail2ban + ufw stop brute force at the network layer.
- Use a non-root deploy user with only the privileges it needs.`,
    },
  ],
}
