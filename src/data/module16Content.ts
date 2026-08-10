import type { Module } from "../types"

export const module16: Module = {
  id: 16,
  title: "Virtualization & Containers",
  status: "upcoming",
  lessons: [
    {
      name: "Virtualization concepts",
      minutes: 11,
      intro:
        "Understand the spectrum from full VMs to containers, and when each makes sense.",
      content: `## Virtualization concepts

"Virtualization" is a spectrum. At one end a **hypervisor** fakes entire physical hardware and runs multiple operating systems; at the other, **containers** share one OS kernel and just isolate processes.

### The stack

\`\`\`
Type 1 hypervisor          Type 2 hypervisor           Containers
 ┌── VM ──┐ ┌── VM ──┐      Host OS runs VMs          Host kernel
 │ App    │ │ App    │       ┌── VM ──┐ ┌── VM ──┐     ┌──────┐ ┌──────┐
 │ OS     │ │ OS     │       │  OS    │ │  OS    │     │ App  │ │ App  │
 └──┴──────┘ └──┴──────┘     └─┴──────┘ └─┴──────┘     └──┬───┘ └──┴───┘
    hypervisor (KVM, ESXi)      hypervisor (VirtualBox)   shared kernel
\`\`\`

### When to pick what

- **VMs** — different OSes, strong isolation, live migration, legacy apps
- **Containers** — many instances, fast startup, dense packing, no kernel choice
- **VMs inside** — run containers *inside a VM* for multi-tenant cloud isolation

### Linux-native hypervisor: KVM

\`\`\`bash
grep -c vmx /proc/cpuinfo   # Intel VT
grep -c svm /proc/cpuinfo   # AMD-V
ls /dev/kvm
\`\`\`

If \`/dev/kvm\` exists, the kernel can host VMs directly.

### Check for virtualization support

\`\`\`bash
lscpu | grep -i virtualization
\`\`\`

> **Key idea:** A VM emulates hardware and runs its own kernel; a container runs on yours. That one fact explains every difference in security, performance, and portability.

### Key recap

- Type 1 (bare-metal) vs Type 2 (hosted) hypervisors.
- KVM makes the Linux kernel itself a hypervisor.
- Containers share the host kernel; VMs don't.
- VMs isolate OSes, containers isolate processes.`,
    },
    {
      name: "KVM/QEMU",
      minutes: 12,
      intro:
        "Create and run true virtual machines with the kernel's own hypervisor.",
      content: `## KVM/QEMU

QEMU provides the wide device emulation; KVM provides hardware-accelerated execution. Together they run full VMs at near-native speed.

### Install

\`\`\`bash
sudo apt install -y qemu-system-x86 qemu-utils libvirt-daemon-system
sudo systemctl enable --now libvirtd
sudo usermod -aG libvirt,kvm $USER
\`\`\`

### Create a disk image

\`\`\`bash
qemu-img create -f qcow2 debian.img 20G
qemu-img info debian.img
\`\`\`

### Boot an installer

\`\`\`bash
qemu-system-x86_64 \
  -accel kvm \
  -cpu host \
  -m 2048 \
  -drive file=debian.iso,media=cdrom \
  -drive file=debian.img,format=qcow2
\`\`\`

### Manage with virsh

The libvirt tooling is cleaner for production:

\`\`\`bash
sudo virsh list --all
sudo virsh start debian-vm
sudo virsh shutdown debian-vm
sudo virsh autostart debian-vm
\`\`\`

### Snapshots

\`\`\`bash
sudo virsh snapshot-create-as debian-vm baseline
sudo virsh snapshot-list debian-vm
\`\`\`

> **Pro tip:** \`-accel kvm -cpu host\` is the speed secret — emulating a generic CPU without KVM is 10-50x slower.

### Key recap

- KVM + QEMU = full hardware-accelerated VMs.
- \`qemu-img\` creates qcow2 disks (copy-on-write, thin).
- virsh is the production-grade management CLI.
- Snapshots give rollback-able machine states.`,
    },
    {
      name: "virt-manager",
      minutes: 10,
      intro:
        "Point-and-click VM management over the same libvirt library virsh uses.",
      content: `## virt-manager

\`virt-manager\` is the GUI for libvirt. It edits the same XML definitions virsh uses, so anything you click you can script and vice versa.

### Install and launch

\`\`\`bash
sudo apt install -y virt-manager
\`\`\`

Connect to your system with a graphical session, or forward the display over SSH:

\`\`\`bash
ssh -X user@host virt-manager
\`\`\`

### What it can do

- Create VMs from ISO or existing images
- Adjust CPU/memory/NIC/disk live (some hot-pluggable)
- Open a graphical console (VNC/Spice)
- Manage storage pools and networks per VM

### Storage pools

\`\`\`bash
sudo virsh pool-list
sudo mkdir /var/lib/libvirt/images
sudo virsh pool-create-as default dir --target /var/lib/libvirt/images
\`\`\`

### Default networking (NAT)

\`\`\`bash
sudo virsh net-list
sudo virsh net-start default
sudo virsh net-autostart default
\`\`\`

VMs on the default NAT network get egress internet and port-forwarding via virbr0.

> **Pro tip:** Use one management path — clicking in virt-manager or scripting virsh — not both mid-debug. The XML (\`virsh dumpxml vm\`) is the source of truth either way.

### Key recap

- virt-manager is a GUI front end for libvirt.
- Everything it does maps to virsh and VM XML.
- Storage pools and NAT networks peer with the VMs.
- \`virsh dumpxml\` reveals the real underlying config.`,
    },
    {
      name: "LXC/LXD",
      minutes: 11,
      intro:
        "Run OS-level 'system containers' that feel like VMs but share the kernel.",
      content: `## LXC/LXD

LXD gives you **system containers** — they boot a full userspace (systemd, apt, a root user) but share the host kernel, so they start in seconds and sip RAM.

### Install LXD

\`\`\`bash
sudo apt install -y lxd
sudo lxd init --auto
\`\`\`

### Launch a container

\`\`\`bash
lxc launch ubuntu:24.04 web1
lxc list
\`\`\`

\`\`\`bash
+------+---------+------+-------------------+-----------+-----------+
| NAME |  STATE  | IPV4 |       IPV6        |   TYPE    | SNAPSHOTS |
+------+---------+------+-------------------+-----------+-----------+
| web1 | RUNNING | ...  | ...               | CONTAINER | 0         |
+------+---------+------+-------------------+-----------+-----------+
\`\`\`

### Enter and manage

\`\`\`bash
lxc exec web1 -- bash
lxc info web1
lxc config set web1 limits.memory 500MiB
lxc config set web1 limits.cpu 2
lxc stop web1 && lxc start web1
\`\`\`

### Snapshots and copies

\`\`\`bash
lxc snapshot web1 clean
lxc restore web1 clean
lxc copy web1 web2
\`\`\`

### Publish a reusable image

\`\`\`bash
lxc publish web1 --alias my-nginx >/dev/null
lxc launch my-nginx web3
\`\`\`

> **Key idea:** LXD changes the "container = stateless single process" mental model for a "container = lightweight VM" model. Same isolation family as Docker, very different unit of work.

### Key recap

- LXD containers boot full userspaces in seconds.
- \`lxc launch/exec/list/info\` are the core verbs.
- Limits like \`limits.memory\`/\`limits.cpu\` tune the container.
- Snapshots, copies, and publish give VM-like workflows.`,
    },
    {
      name: "Podman",
      minutes: 11,
      intro:
        "Run OCI containers rootless and daemon-less — a drop-in Docker replacement without Docker.",
      content: `## Podman

Podman runs the same OCI containers as Docker but with no central daemon: **rootless** by default and process-level isolated via cgroups v2. The CLI is nearly identical.

### Install

\`\`\`bash
sudo apt install -y podman
podman --version
\`\`\`

### A familiar first run

\`\`\`bash
podman run -d -p 8080:80 --name web nginx
podman ps
podman exec -it web bash
podman stop web && podman rm web
\`\`\`

### No sudo needed

\`\`\`bash
id -u
podman info | grep -A2 rootless
\`\`\`

Rootless containers run in an isolated user namespace with your UID — no root-daemon, no privilege to abuse.

### Managing images

\`\`\`bash
podman images
podman pull postgres:16
podman rmi nginx
\`\`\`

### Compose support

\`podman-compose\` runs existing \`docker-compose.yml\` files:

\`\`\`bash
sudo apt install -y podman-compose
podman-compose up -d
\`\`\`

### Systemd integration

Log in on boot and manage containers as services:

\`\`\`bash
podman generate systemd --new --name web > /etc/systemd/system/web-container.service
systemctl --user enable --now web-container.service
\`\`\`

> **Pro tip:** \`alias docker=podman\` works for most workflows. Rootless-first means a container breakout doesn't grant host root — a genuine security win over Docker defaults.

### Key recap

- Podman is daemon-less and rootless by default.
- The CLI mirrors Docker (\`run\`, \`ps\`, \`exec\`, \`build\`).
- \`podman-compose\` runs compose files unchanged.
- \`podman generate systemd\` turns containers into boot services.`,
    },
    {
      name: "Kubernetes basics",
      minutes: 13,
      intro:
        "Understand the building blocks of container orchestration: Pods, Deployments, Services.",
      content: `## Kubernetes basics

Kubernetes (k8s) schedules containers across a cluster of machines. Its vocabulary is precise — learn the objects and the ecosystem demystifies.

### Core objects

- **Pod** — the smallest unit; one or more containers sharing a network namespace and IP
- **Deployment** — declares "I want 3 replicas of this image", k8s keeps them healthy
- **Service** — a stable IP/DNS in front of a set of pods
- **ConfigMap / Secret** — config and credentials injected into pods

### A minimal Deployment

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:stable
        ports:
        - containerPort: 80
\`\`\`

\`\`\`bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl get deploy
kubectl rollout status deploy/web
\`\`\`

### Expose it

\`\`\`bash
kubectl expose deployment web --port 80 --type LoadBalancer
kubectl get svc
\`\`\`

### Scaling

\`\`\`bash
kubectl scale deployment web --replicas=6
kubectl scale deployment web --replicas=2
\`\`\`

### Logs and exec

\`\`\`bash
kubectl logs deploy/web
kubectl exec -it $(kubectl get pod -l app=web -o name | head -1) -- bash
\`\`\`

> **Key idea:** You rarely touch pods directly. You declare Desired State in a Deployment; Kubernetes reconciles reality to match it. That "reconcile loop" is the entire philosophy.

### Key recap

- Pod = scheduling unit; Deployment = desired count; Service = stable access.
- \`kubectl apply\` declares state; k8s converges toward it.
- \`rollout\`, \`scale\`, \`logs\`, \`exec\` manage daily life.
- Start with minikube/k3s to practice locally.`,
    },
    {
      name: "k3s & minikube",
      minutes: 11,
      intro:
        "Run a real Kubernetes cluster on one laptop or a tiny edge server.",
      content: `## k3s & minikube

Real k8s is heavy. k3s (a certified lightweight distribution) and minikube (a single-node dev cluster) let you learn on hardware you already own.

### minikube (developer laptop)

\`\`\`bash
sudo apt install -y conntrack
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start --driver=docker
kubectl get nodes
\`\`\`

### k3s (edge / single-node)

\`\`\`bash
curl -sfL https://get.k3s.io | sh -
sudo k3s kubectl get nodes
\`\`\`

k3s bundles containerd, its own load balancer, and a Helm chart manager — one binary, single node, tiny footprint.

### Deploy something tiny

\`\`\`bash
kubectl create deploy hello --image=nginxdemos/hello
kubectl expose deploy hello --port 80 --type NodePort
kubectl get svc
curl http://$(minikube ip):$(kubectl get svc hello -o jsonpath='{.spec.ports[0].nodePort}')
\`\`\`

### Dashboard

\`\`\`bash
minikube dashboard
\`\`\`

> **Pro tip:** Use minikube to *learn the API*; use k3s when you want a real long-running cluster on one box. Both give the same \`kubectl\` surface, so skills transfer.

### Key recap

- minikube runs a one-node cluster in a VM/container.
- k3s is a certified, lightweight single-binary distro.
- Both expose the real Kubernetes API via kubectl.
- NodePort services let you reach pods from the host.`,
    },
    {
      name: "Container networking",
      minutes: 12,
      intro:
        "See how containers get IPs, talk to each other, and reach (or hide from) the outside world.",
      content: `## Container networking

Container networking is userspace plumbing: virtual bridges, veth pairs, NAT, and iptables. Same concepts as VLANs — just inside your host.

### The default Docker bridge

\`\`\`bash
docker network ls
docker network inspect bridge | head -40
ip addr show docker0
\`\`\`

Containers attach veth pairs to the \`docker0\` bridge and get IPs from a private range. Outbound traffic is NAT'd; inbound needs \`-p 8080:80\`.

### A custom network

\`\`\`bash
docker network create --driver bridge appnet
docker run -d --network appnet --name api myapi
docker run -d --network appnet --name web nginx
docker exec web getent hosts api
\`\`\`

Containers on the *same custom bridge* resolve each other by name — no hardcoded IPs.

### Container to host

\`\`\`bash
docker run --rm alpine sh -c 'getent hosts host.docker.internal'
\`\`\`

Use \`host.docker.internal\` to reach host-local services.

### Inspect connectivity

\`\`\`bash
docker run --rm --network host alpine ip addr   # host netns
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' api
\`\`\`

### Host network mode

\`\`\`bash
docker run --rm --network host nginx
\`\`\`

Shared namespace = no port mapping needed, but no isolation.

> **Key idea:** Every bridge network = a mini LAN with DNS. Custom networks give names like \`api\` that resolve inside containers; the default bridge does not.

### Key recap

- \`docker0\` bridge + veth pairs = the default docker network.
- Custom bridges add per-name DNS between containers.
- \`-p 8080:80\` maps ports; \`--network host\` skips isolation.
- \`host.docker.internal\` reaches host services from a container.`,
    },
    {
      name: "Vagrant",
      minutes: 11,
      intro:
        "Spin up reproducible dev VMs from a single Vagrantfile.",
      content: `## Vagrant

Vagrant defines disposable development environments as code. One \`Vagrantfile\` describes the box, CPU/RAM, provisioning steps — and \`vagrant up\` makes it real.

### A Vagrantfile

\`\`\`ruby
Vagrant.configure("2") do |config|
  config.vm.box = "debian/bookworm64"
  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 2048
    vb.cpus = 2
  end
  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install -y nginx
  SHELL
end
\`\`\`

### The workflow

\`\`\`bash
vagrant up            # create + provision
vagrant ssh           # shell inside
vagrant reload        # reboot with config changes
vagrant provision     # re-run provisioning only
vagrant destroy -f    # tear it all down
\`\`\`

### Multi-machine

One file, several VMs:

\`\`\`ruby
config.vm.define "db" do |db|
  db.vm.box = "debian/bookworm64"
  db.vm.network "private_network", ip: "192.168.56.10"
end
config.vm.define "app" do |app|
  app.vm.box = "debian/bookworm64"
  app.vm.network "private_network", ip: "192.168.56.11"
end
\`\`\`

> **Key idea:** The magic is reproducibility: \`vagrant up\` in a fresh checkout reproduces the exact environment. Teammates stop saying "works on my machine".

### Key recap

- \`Vagrantfile\` = declarative dev environment.
- \`vagrant up/ssh/reload/provision/destroy\` is the loop.
- Forwarded ports and private networks wire VMs together.
- Provision with shell scripts or move up to Ansible/Puppet.`,
    },
    {
      name: "Proxmox",
      minutes: 11,
      intro:
        "Meet the open-source hypervisor platform that runs whole home-lab and small-business fleets.",
      content: `## Proxmox

Proxmox VE is a Debian-based platform that bundles a hypervisor (KVM), LXC, storage pooling, and a web UI into one appliance. It's the standard for home labs and small production.

### What it bundles

- **Virtualization** — KVM VMs and LXC containers side-by-side
- **Cluster control** — multi-node management from one UI
- **Storage** — ZFS, LVM, and dir storage with snapshots/replication
- **Backups** — scheduled vzdump backups to a backup store

### The CLI behind the UI

SSH in and you're on real Debian:

\`\`\`bash
qm list                    # VMs
pct list                   # LXC containers
qm start 100 && qm monitor 100
vzdump 100 --dumpdir /var/lib/vz/dump
\`\`\`

### Storage pools

\`\`\`bash
pvesm status
pvesm set local-zfs -content images
\`\`\`

### Replication for HA

\`\`\`bash
pvesr create-local-job jobname --source 100 --target node2
\`\`\`

> **Key idea:** Proxmox composes the tools you've already learned — the kernel hypervisor from module 16's KVM lessons, containers from LXC — and hands them a management plane so a cluster behaves like one server.

### Key recap

- Proxmox = KVM + LXC + storage + web UI on Debian.
- \`qm\` for VMs, \`pct\` for containers, \`vzdump\` for backups.
- ZFS/LVM pools give snapshots and replication.
- It's how small infra teams run real clusters affordably.`,
    },
  ],
}