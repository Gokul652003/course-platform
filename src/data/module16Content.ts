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
  ],
}