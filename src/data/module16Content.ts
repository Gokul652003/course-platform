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
  ],
}