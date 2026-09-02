import type { Module } from "../types"

export const systemDesignModule12: Module = {
  id: 12,
  title: "Low-Level Design & the Interview Playbook",
  status: "upcoming",
  lessons: [
    {
      name: "OOP, SOLID, DRY/KISS/YAGNI & UML for LLD",
      minutes: 12,
      intro: "See how Low-Level Design turns a high-level architecture into concrete classes and interfaces, refresh the OOP fundamentals that underpin it, and learn the SOLID principles and UML notation used to design and communicate it.",
      content: `## From boxes to classes: what LLD actually is

High-Level Design answers "what components exist and how do they talk to each other" — a load balancer, an API service, a database, a cache, drawn as boxes and arrows. **Low-Level Design (LLD)** answers the next question down: "inside that API service, what classes and interfaces actually exist, what data do they hold, and how do they collaborate to implement the behavior HLD promised?" Where HLD is architecture, LLD is concrete, implementable structure — the kind of detail you could hand to an engineer and have them start writing code from directly.

\`\`\`text
HLD: [Client] --> [API Service] --> [Database]

LLD (inside API Service):
  class BookingController { createBooking(request) }
  class BookingService { validateAndBook(booking) }
  interface PaymentGateway { charge(amount) }
  class BookingRepository { save(booking) }
\`\`\`

LLD interviews specifically test whether you can take a feature ("design a parking lot," "design an elevator system") and produce a clean, extensible class structure for it — not whether you can draw a system architecture diagram.

## OOP fundamentals, as they matter for LLD

Four ideas recur in essentially every LLD discussion:

- **Encapsulation** — bundling data with the methods that operate on it, and hiding internal state behind a controlled interface, so a class's internals can change without breaking everything that uses it.
- **Abstraction** — exposing only what a caller needs to know (an interface, a method signature) while hiding how it's actually implemented underneath.
- **Inheritance** — a class acquiring behavior and structure from a parent class, modeling an "is-a" relationship (\`SavingsAccount extends Account\`).
- **Polymorphism** — different classes responding to the same method call in their own way, so calling code can treat them uniformly.

A small example tying them together:

\`\`\`java
interface PaymentMethod {
    void pay(double amount);
}

class CreditCard implements PaymentMethod {
    public void pay(double amount) { /* charge the card */ }
}

class Wallet implements PaymentMethod {
    public void pay(double amount) { /* deduct wallet balance */ }
}

void checkout(PaymentMethod method, double amount) {
    method.pay(amount); // polymorphism: caller doesn't care which one it is
}
\`\`\`

\`checkout\` never needs to know or care whether it received a \`CreditCard\` or a \`Wallet\` — that's abstraction and polymorphism doing their job, and it's exactly the kind of design that makes adding a third payment method later a small, isolated change instead of a rewrite.

## SOLID: five principles for classes that survive change

**S — Single Responsibility Principle.** A class should have exactly one reason to change. A class that both validates a booking *and* sends a confirmation email *and* writes to the database has three reasons to change, and a change to email formatting risks breaking booking validation by accident. Split it into three focused classes instead.

**O — Open/Closed Principle.** Classes should be open for extension but closed for modification. Adding a new payment method shouldn't require editing the checkout logic — it should mean adding a new class that implements the existing \`PaymentMethod\` interface, exactly as shown above.

**L — Liskov Substitution Principle.** A subclass must be usable anywhere its parent class is expected, without breaking correctness. If \`Square extends Rectangle\` but overrides \`setWidth\` to also change the height (to stay square), code that sets width and height independently on a \`Rectangle\` now behaves unexpectedly on a \`Square\` — a classic violation.

**I — Interface Segregation Principle.** Don't force a class to implement methods it doesn't need. A fat \`Worker\` interface with \`work()\` and \`eat()\` forces a \`RobotWorker\` to implement a meaningless \`eat()\` method — split into smaller, focused interfaces instead.

**D — Dependency Inversion Principle.** High-level modules shouldn't depend on low-level implementation details directly — both should depend on abstractions. \`BookingService\` should depend on the \`PaymentGateway\` interface, not directly on a concrete \`StripeGateway\` class, so the concrete implementation can be swapped (or mocked in tests) without touching \`BookingService\` at all.

## DRY, KISS, YAGNI: guardrails, not laws

- **DRY (Don't Repeat Yourself)** — the same logic shouldn't be duplicated in multiple places, because duplicated logic drifts out of sync the moment one copy gets fixed and the other doesn't.
- **KISS (Keep It Simple, Stupid)** — prefer the simplest design that correctly solves the actual problem; cleverness that isn't earning its complexity is a liability, not a strength.
- **YAGNI (You Aren't Gonna Need It)** — don't build flexibility or abstraction for a hypothetical future requirement that hasn't actually arrived; it adds real cost today for a benefit that may never materialize.

These three actively pull against over-applying SOLID: SOLID done well produces clean, extensible structure; SOLID done reflexively produces a maze of interfaces and abstractions for problems that were never going to need them. In an interview, showing judgment about *when* an abstraction earns its keep matters more than mechanically naming all five SOLID letters.

## UML: the notation for communicating LLD

**UML (Unified Modeling Language)** class diagrams are the standard way to draw LLD, and the relationships between classes carry specific, distinct meaning:

| Relationship | Meaning | Example |
|---|---|---|
| Association | Two classes are related, each can exist independently | \`Teacher\` teaches \`Student\` |
| Aggregation | A "has-a" relationship where the part can exist without the whole ("weak" ownership) | \`Department\` has \`Professors\` — a professor still exists if the department is dissolved |
| Composition | A "has-a" relationship where the part cannot exist without the whole ("strong" ownership) | \`House\` has \`Rooms\` — a room doesn't exist independently of its house |
| Inheritance | An "is-a" relationship | \`SavingsAccount\` is an \`Account\` |

\`\`\`text
Account <|-- SavingsAccount        (inheritance)
Department o-- Professor            (aggregation)
House *-- Room                      (composition)
Teacher -- Student                  (association)
\`\`\`

Getting aggregation and composition right specifically — whether the "part" can outlive the "whole" — is the detail interviewers most often probe, because it forces you to actually think through the object lifecycle rather than just the surface structure.

> **Key idea:** LLD turns an HLD architecture into concrete classes and interfaces; OOP's four pillars (encapsulation, abstraction, inheritance, polymorphism) are the raw material; SOLID gives five principles for classes that tolerate change well, while DRY/KISS/YAGNI guard against over-applying them into needless complexity; and UML class diagrams — especially getting aggregation vs. composition right — are the shared notation for communicating the result.`,
    },
  ],
}
