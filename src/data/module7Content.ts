import type { Module } from "../types"

export const module7: Module = {
  id: 7,
  title: "Networking",
  status: "upcoming",
  lessons: [
    {
      name: "IP addresses",
      minutes: 9,
      intro: "Understand the unique numbers that give every device an address on a network.",
      content: `## How Devices Are Found: IP addresses

### What an IP address is

An **IP address** is a unique number that identifies a device on a network. When one computer talks to another, it addresses the packets to the destination's IP — like a postal address for machines.

### IPv4 format

An IPv4 address is four numbers separated by dots:

\`\`\`
192.168.1.25
\`\`\`

Each number is from **0 to 255**.

### Private vs public addresses

- **Public** — routable on the internet, assigned to your router
- **Private** — used inside your home or office, not routable online

Common private ranges:

- \`10.0.0.0/8\`
- \`172.16.0.0/12\`
- \`192.168.0.0/16\`

Your home devices almost always sit on a \`192.168.x.x\` private network.

### IPv6

The longer, newer format designed because IPv4 ran out of space:

\`\`\`
2001:db8:85a3::8a2e:370:7334
\`\`\`

### Find your own IP

\`\`\`bash
ip addr
\`\`\`

Look for the line \`inet\` under your active interface.

> **Key idea:** Most home devices share one public IP, because the router translates private addresses to the outside world using NAT.

### Key recap

- An IP address uniquely identifies a device on a network
- IPv4 uses four 0-255 numbers separated by dots
- Private ranges like \`192.168.x.x\` are used inside networks
- \`ip addr\` shows your device's own addresses`,
    },
    {
      name: "ping",
      minutes: 8,
      intro: "Test if a host is reachable and measure round-trip latency.",
      content: `## Testing Connectivity with ping

### What ping does

\`ping\` sends **ICMP echo request** packets to a host and waits for replies. A reply proves the host is reachable and shows how fast the round trip took.

### Basic usage

\`\`\`bash
ping example.com
\`\`\`

Output:

\`\`\`
PING example.com (93.184.216.34) 56(84) bytes of data.
64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=18.2 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=56 time=17.9 ms
\`\`\`

Press \`Ctrl+C\` to stop.

### Limit the count

\`\`\`bash
ping -c 4 example.com
\`\`\`

Sends exactly four packets and exits, printing a summary:

\`\`\`
4 packets transmitted, 4 received, 0% packet loss
\`\`\`

### What the output means

- **time=** — round-trip time in milliseconds (lower is better)
- **0% packet loss** — every packet came back (healthy)
- **100% packet loss** or \`Destination Host Unreachable\` — no route or host down

> **Key idea:** \`ping\` tests basic reachability only. A host may ping fine yet reject real traffic if a firewall blocks the actual port.

> **Pro tip:** Always pass \`-c N\`, or ping runs forever until you press \`Ctrl+C\`.

### Key recap

- \`ping\` sends ICMP echo requests and times replies
- \`ping -c 4 host\` limits the count
- High \`time\` means slow, \`timeout\` means unreachable
- Connectivity alone does not guarantee a service works`,
    },
    {
      name: "ip",
      minutes: 9,
      intro: "The modern command to configure and inspect network interfaces and routes.",
      content: `## The Modern ip Command

### What ip replaces

The \`ip\` command is the modern replacement for the older \`ifconfig\`. It can read and change addresses, routes, and interfaces.

### Show all interfaces

\`\`\`bash
ip addr
\`\`\`

Sample output:

\`\`\`
2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500
    link/ether 00:16:3e:... brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.25/24 scope global eth0
\`\`\`

The \`inet\` line shows the IPv4 address and subnet (\`/24\`). \`UP\` means the interface is active.

### Summary of one interface

\`\`\`bash
ip -br addr
\`\`\`

\`\`\`
eth0 UP 192.168.1.25/24
\`\`\`

The \`-br\` (brief) flag prints a compact one-line view.

### Show routes

\`\`\`bash
ip route
\`\`\`

\`\`\`
default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0
\`\`\`

The \`default via\` line is your gateway — the path out to the internet.

### Show ARP neighbor table

\`\`\`bash
ip neigh
\`\`\`

> **Key idea:** Learn \`ip\`, not \`ifconfig\`. Every modern distribution ships \`ip\`, and new tools assume you know it.

### Key recap

- \`ip\` replaces \`ifconfig\` for interface and route management
- \`ip addr\` lists addresses; \`ip route\` lists routes
- The default route via your gateway is how you reach the internet
- \`ip -br addr\` gives a compact status view`,
    },
    {
      name: "ss",
      minutes: 8,
      intro: "Display active network sockets and check what is actually listening.",
      content: `## Inspecting Sockets with ss

### What ss is

\`ss\` (socket statistics) shows active network connections and listening ports. It replaced the older \`netstat\`. It reads kernel data directly, so it is fast.

### Show all sockets

\`\`\`bash
ss
\`\`\`

### Show listening sockets only

\`\`\`bash
ss -l
\`\`\`

When debugging a service, you want this. Add port numbers and names:

\`\`\`bash
ss -lnt
\`\`\`

Output:

\`\`\`
State   Local Address:Port  Peer Address:Port
LISTEN  0.0.0.0:80          0.0.0.0:*
LISTEN  0.0.0.0:22          0.0.0.0:*
\`\`\`

Here \`:80\` (HTTP) and \`:22\` (SSH) are accepting connections.

### Flags to know

- \`-l\` — listening sockets
- \`-t\` — TCP only
- \`-u\` — UDP only
- \`-n\` — numeric ports, no name lookup
- \`-p\` — show the process using each socket

### Which process listens where

\`\`\`bash
sudo ss -ltnp
\`\`\`

The \`-p\` flag adds the owning process; \`sudo\` reveals all processes.

> **Key idea:** \`ss -lnt\` is the fastest way to answer "is my web server actually listening on port 80?"

### Key recap

- \`ss\` shows connections and listening sockets
- \`ss -l\` lists listeners; \`ss -lnt\` add numeric ports
- \`sudo ss -ltnp\` identifies the process behind each socket
- \`ss\` is the modern replacement for \`netstat\``,
    },
    {
      name: "netstat",
      minutes: 7,
      intro: "The classic tool for viewing sockets, routes, and network statistics.",
      content: `## The Classic netstat Command

### What netstat is

\`netstat\` (network statistics) predates \`ss\` and shows the same kind of information: sockets, routing tables, and interface stats. Many older systems and tutorials still use it.

### Check if netstat is installed

Some distros do not include it by default. Install it with \`net-tools\`:

\`\`\`bash
sudo apt install net-tools
\`\`\`

### List listening ports

\`\`\`bash
netstat -lnt
\`\`\`

\`\`\`
Proto Recv-Q Send-Q Local Address     Foreign Address  State
tcp   0      0      0.0.0.0:22        0.0.0.0:*        LISTEN
\`\`\`

\`:22\` is listening for SSH.

### Show all established connections

\`\`\`bash
netstat -t
\`\`\`

### Show the routing table

\`\`\`bash
netstat -r
\`\`\`

### Common flag meanings

- \`-l\` — listening sockets
- \`-t\` — TCP
- \`-n\` — numeric, skip name lookups
- \`-p\` — show processes (needs sudo)
- \`-r\` — routing table

> **Key idea:** \`netstat\` and \`ss\` accept almost identical flags. Learning one transfers to the other.

> **Pro tip:** Prefer \`ss\` on modern systems — it is faster and always installed — but know \`netstat\` because old docs still use it.

### Key recap

- \`netstat\` shows sockets, routes, and statistics
- \`netstat -lnt\` lists listening ports
- Flags mirror \`ss\`: \`-l\`, \`-t\`, \`-n\`, \`-p\`, \`-r\`
- Use \`ss\` on new systems; \`netstat\` often needs \`net-tools\``,
    },
    {
      name: "curl",
      minutes: 10,
      intro: "Transfer data from servers with a focused, scriptable command-line tool.",
      content: `## Transferring Data with curl

### What curl is

\`curl\` is a command-line tool for transferring data using URL syntax. It powers almost every web request you make from the terminal.

### Fetch a page

\`\`\`bash
curl https://example.com
\`\`\`

The HTML of the page prints directly to your terminal.

### Save the output

\`\`\`bash
curl -o page.html https://example.com
\`\`\`

Use \`-o\` to write the response to a file instead of the screen.

### Show response headers

\`\`\`bash
curl -I https://example.com
\`\`\`

\`\`\`
HTTP/1.1 200 OK
content-type: text/html
date: Mon, 06 Aug 2026 12:00:00 GMT
\`\`\`

The \`-I\` flag fetches headers only — perfect for checking if a site is up.

### Follow redirects

\`\`\`bash
curl -L https://example.com
\`\`\`

Add \`-L\` to follow \`Location\` redirects.

### Silent mode

\`\`\`bash
curl -s https://example.com
\`\`\`

The \`-s\` flag suppresses progress meter and error output, useful in scripts.

> **Key idea:** \`curl\` talks to HTTP endpoints directly. It is the tool to test an API with one line from the terminal.

### Common flags

- \`-o\` — write output to a file
- \`-I\` — headers only
- \`-L\` — follow redirects
- \`-s\` — silent
- \`-X POST\` — send a POST request

### Key recap

- \`curl\` transfers data to or from a URL
- \`curl -o file\` saves the response
- \`curl -I\` checks headers without downloading a page
- \`-L\` follows redirects; \`-s\` keeps output clean`,
    },
    {
      name: "wget",
      minutes: 8,
      intro: "Download files and even entire sites with a dedicated downloader.",
      content: `## Downloading Files with wget

### What wget is

\`wget\` is a downloader for retrieving files from the internet. Unlike \`curl\`, it is built around downloading files reliably, including resuming interrupted downloads.

### Download a single file

\`\`\`bash
wget https://example.com/file.iso
\`\`\`

Output shows progress, download speed, and elapsed time:

\`\`\`
file.iso          12%[=====>          ]  43.2M  2.1MB/s  eta 26s
\`\`\`

### Save with a different name

\`\`\`bash
wget -O archive.tar.gz https://example.com/a.tar.gz
\`\`\`

### Resume a download

\`\`\`bash
wget -c https://example.com/file.iso
\`\`\`

The \`-c\` flag continues a partial download instead of starting over.

### Download a whole directory

\`\`\`bash
wget -r -l 1 https://example.com/docs/
\`\`\`

The \`-r\` flag recurses; the \`-l 1\` limits depth to one level.

> **Key idea:** For a one-line file pull, both \`curl\` and \`wget\` work. \`wget\` excels at recursive and resumable downloads; \`curl\` is better for APIs and fine-grained control.

### Common flags

- \`-O\` — output to a named file
- \`-c\` — continue an interrupted download
- \`-r\` — recursive
- \`-q\` — quiet

### Key recap

- \`wget\` downloads files from the web
- \`wget -c\` resumes a partial download
- \`wget -r\` pulls whole directories recursively
- \`wget\` shines for mirrors; \`curl\` for scripts`,
    },
    {
      name: "ssh",
      minutes: 11,
      intro: "Securely log into remote machines and run commands over an encrypted channel.",
      content: `## Secure Remote Login with ssh

### What ssh is

\`ssh\` (Secure Shell) lets you log into a remote computer and run commands there. All traffic is **encrypted** — no passwords or data travel in plain text.

### Connect to a server

\`\`\`bash
ssh gokul@192.168.1.50
\`\`\`

If the default port differs, use \`-p\`:

\`\`\`bash
ssh -p 2222 gokul@192.168.1.50
\`\`\`

You get an interactive shell on the remote machine. Type \`exit\` to return.

### Run a single command remotely

\`\`\`bash
ssh gokul@192.168.1.50 "uptime"
\`\`\`

Runs \`uptime\` on the remote and prints the result locally.

### Key-based login

Generate a key once:

\`\`\`bash
ssh-keygen -t ed25519
\`\`\`

Copy it to the server:

\`\`\`bash
ssh-copy-id gokul@192.168.1.50
\`\`\`

Now you can log in without typing a password.

> **Key idea:** Key-based login is faster and more secure than passwords. \`ssh-copy-id\` installs your public key so the server recognizes you automatically.

> **Pro tip:** \`~/.ssh/config\` can store hosts, so \`ssh myhost\` replaces the full address.

### Troubleshooting

- \`Connection refused\` — SSH server not running or firewall blocks port 22
- \`Permission denied\` — wrong key or password served on the host

### Key recap

- \`ssh\` gives encrypted remote shells
- \`ssh user@host\` connects; \`"cmd"\` runs one command
- \`ssh-copy-id\` enables passwordless key login
- \`ssh -p\` selects a non-standard ports`,
    },
    {
      name: "scp",
      minutes: 8,
      intro: "Securely copy files between your machine and a remote server.",
      content: `## Copying Files with scp

### What scp is

\`scp\` (secure copy) copies files between machines using SSH, so the transfer is **encrypted** and uses the same authentication as \`ssh\`.

### Copy a file to a server

\`\`\`bash
scp report.pdf gokul@192.168.1.50:/home/gokul/
\`\`\`

### Copy a file from a server

\`\`\`bash
scp gokul@192.168.1.50:/home/gokul/data.csv .
\`\`\`

The trailing \`.\` means "save into the current directory".

### Copy a directory recursively

\`\`\`bash
scp -r projects/ gokul@192.168.1.50:/home/gokul/
\`\`\`

The \`-r\` flag copies a whole directory tree.

### Specify a different port

\`\`\`bash
scp -P 2222 file.txt gokul@192.168.1.50:/tmp/
\`\`\`

Note: scp uses uppercase \`-P\` for port, unlike \`ssh\` which uses lowercase \`-p\`.

> **Key idea:** \`scp\` syntax is \`source destination\`, and ssh-managed credentials (keys) apply. If \`ssh\` works, \`scp\` will too.

> **Pro tip:** For large or recurring syncs, prefer \`rsync\` — it can skip already-copied files. For one-off copies, \`scp\` is simple.

### Key recap

- \`scp\` copies files/securely over SSH
- \`scp file user@host:/path\` uploads; reversing copies down
- \`scp -r\` copies directories
- Use uppercase \`-P\` for the port on \`scp\``,
    },
    {
      name: "rsync",
      minutes: 11,
      intro: "Efficiently sync files between local and remote locations with delta transfers.",
      content: `## Efficient File Syncing with rsync

### What rsync does

\`rsync\` copies and synchronizes files, transferring only what **changed** (delta updates). This makes repeated backups and mirrorings fast and bandwidth-friendly.

### The basic form

\`\`\`bash
rsync -av source/ destination/
\`\`\`

- \`-a\` — archive mode: preserves permissions, times, links
- \`-v\` — verbose

The trailing slash on \`source/\` copies the contents of the directory; without it, the directory itself is copied.

### Copy to a remote

\`\`\`bash
rsync -av /home/gokul/data/ gokul@192.168.1.50:/backup/data/
\`\`\`

Works over SSH by default.

### Dry run: preview before you run

\`\`\`bash
rsync -av --dry-run source/ destination/
\`\`\`

Use \`--dry-run\` to preview before you run. Output shows \`f+++++++++\` for new files and \`f......T\` for touched files.

### Delete missing files on the destination

\`\`\`bash
rsync -av --delete source/ destination/
\`\`\`

Removing files no longer present in the source, so destination is an exact mirror.

### Speed up with compression

\`\`\`bash
rsync -avz source/ destination/
\`\`\`

The \`-z\` compresses during transfer, great on slow links.

> **Key idea:** The magic of rsync is it checks hashes and only transfers changed pieces — dramatically better than re-copying whole files.

> **Pro tip:** Trailing slashes matter. \`source/\` means its *contents*; \`source\` means the *folder itself* enters the destination.

### Key recap

- \`rsync\` copies only what changed, saving bandwidth
- \`-a\` preserves attributes; \`-v\` adds verbose output
- \`--dry-run\` previews before changes
- \`--delete\` makes the destination an exact mirror`,
    },
    {
      name: "DNS tools",
      minutes: 9,
      intro: "Resolve names to IP addresses and diagnose lookup problems.",
      content: `## Investigating DNS with dig, nslookup, and host

### What DNS is

DNS (Domain Name System) translates human-friendly names like \`example.com\` into IP addresses. These tools query DNS servers to find and verify those mappings.

### dig — the detailed query

\`\`\`bash
dig example.com
\`\`\`

Sample answer section:

\`\`\`
;; ANSWER SECTION:
example.com. 3600 IN A 93.184.216.34
\`\`\`

The \`A\` record maps the name to an IPv4 address.

### Get a specific record

\`\`\`bash
dig example.com MX
\`\`\`

\`\`\`
example.com. 3600 IN MX 10 mail.example.com.
\`\`\`

shows the mail server handling mail for the domain.

### nslookup — a simpler tool

\`\`\`bash
nslookup example.com
\`\`\`

### host — a quick check

\`\`\`bash
host example.com
\`\`\`

\`\`\`
example.com has address 93.184.216.34
\`\`\`

### Reverse lookup

\`\`\`bash
dig -x 93.184.216.34
\`\`\`

Finds the name for an IP address (the reverse order).

> **Key idea:** \`dig\` is the most detailed and scriptable DNS tool. Start with \`host\` for a fast peek and fall back to \`dig\` when you need full answers.

> **Warning:** "Name or service not known" usually means the DNS lookup failed — check connectivity before blaming the domain.

### Key recap

- DNS maps domain names to IP addresses
- \`dig\` prints detailed records and answers
- \`nslookup\` and \`host\` give simpler output
- \`dig -x\` reverses an IP back to a name`,
    },
    {
      name: "Ports",
      minutes: 8,
      intro: "Understand the numbered endpoints that let one server host many services.",
      content: `## Understanding Ports

### What a port is

A **port** is a numbered endpoint on an IP address. Combined with the IP, it identifies a specific service on a specific machine. Ports let one server run a webserver, SSH, and email all at once.

\`\`\`
192.168.1.50          netaddr-to:named-host
                     ┌─────────────┐
                     │ port 22 = ssh│
  192.168.1.50 ─────►│ port 80 = web │
                     │ port 443 = web│
                     └─────────────┘
\`\`\`

### Well-known ports under 1024

- \`22\` — SSH
- \`80\` — HTTP
- \`443\` — HTTPS
- \`53\` — DNS

These low ports usually require root to bind.

### Registered ports

Service ports above 1024, such as:

- \`3306\` — MySQL
- \`5432\` — PostgreSQL
- \`6379\` — Redis
- \`8080\` — common non-privileged HTTP

### How addressing works

A connection is identified by the tuple **IP:port**, e.g. \`192.168.1.50:443\`. The server listens on the port; the client connects to it.

### See ports in use

\`\`\`bash
ss -lnt
\`\`\`

### Test if a port is open. Use nc (netcat):

\`\`\`bash
nc -zv 192.168.1.50 443
\`\`\`

> **Key idea:** The port, with the IP, allows many services on one machine without collision. Learning the famous ones (22, 80, 443) covers web servers and servers.

### Key recap

- Ports are numbered endpoints on an IP address
- Low ports like 22, 80, 443 are the famous services
- IP:port uniquely identifies a service on a machine
- \`ss -lnt\` and \`nc -zv\` check listening/open ports`,
    },
    {
      name: "Firewalls",
      minutes: 10,
      intro: "Filter traffic in or out of your machine based on rules.",
      content: `## Controlling Traffic with Firewalls

### What a firewall does

A **firewall** filters network traffic based on rules — allowing or **dropping** packets by source, destination, port, and protocol. It protects services you do not want exposed.

### The two common tools in Linux

- **iptables** — the classic low-level packet filter
- **firewalld** / **ufw** — friendlier wrappers on top of it

### Viewing. with nftables/iptables

\`\`\`bash
sudo iptables -L -n
\`\`\`

Shows the current chains and rules as numeric output.

### Simple usage with ufw

Enable a default deny-tail firewall and open the ports you need:

\`\`\`bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
\`\`\`

### Allow with iptables

\`\`\`bash
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
\`\`\`

\`-A\` appends a rule to the INPUT chain allowing TCP on port 22.

### Default policy

A common strategy: **block all inbound by default, allow only what you need**. This is what \`ufw enable\` does when paired with specific allows.

> **Key idea:** \`ufw allow ssh\` is shorthand for allowing inbound TCP port 22. The allow-list approach is safer than trying to block, because you only expose what you know you need.

> **Pro tip:** Check \`ufw status\` after changes. Firewall changes are easy to mess up — test by opening a new SSH session before you lock yourself out.

### Key recap

- Firewalls filter traffic by rule
- \`iptables\` is the low-level engine; \`ufw\` and \`firewalld\` wrap it
- \`ufw allow <port>\` opens service
- Default deny + explicit allow is the safest policy`,
    },
    {
      name: "Routing basics",
      minutes: 10,
      intro: "How packets travel hop by hop and how your default gateway points outbound.",
      content: `## Routing Packets from Host to Host

### What routing is

**Routing** is how packets find their path from source to destination, hopping through routers hop by hop. Each router decides where to send a packet next based on its **routing table**.

\`\`\`
Your PC ──► Router ──► ISP ──► destination
  192.168.1.25   192.168.1.1   (the internet)
\`\`\`

### The default route

Every host has a **default route** — the router to send packets to when no more-specific rule matches. On your home network that is your router.

\`\`\`bash
ip route
\`\`\`

\`\`\`
default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0
\`\`\`

- \`default via 192.168.1.1\` — outbound traffic leaves via the gateway
- \`192.168.1.0/24 dev eth0\` — traffic on your local subnet stays on the interface

### Routing table entries

Each entry pairs a **destination network** with a **next hop**. The router picks the longest, most specific match.

### Trace the path

\`\`\`bash
traceroute example.com
\`\`\`

Shows every router hop the packet crosses on the way.

### Add a route

\`\`\`bash
sudo  ip route add 10.0.0.0/8 via 192.168.1.1
\`\`\`

Adds a route sending the \`10.0.0.0/8\` network via the router.

> **How it works:** When you send to \`93.184.216.34\`, only the destination matters — every router uses its own table toward the final \`final hop creates the final hop\`. Routing is hop-by-hop, not a single map known to source.

### Key recap

- IP packets route hop-by-hop through routers
- A default route sends traffic toward the internet
- The local subnet stays on the interface, no router needed
- \`ip route\` inspects; and \`traceroute\` traces the path`,
    },
  ],
}