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
    {
      name: "Common Design Patterns in System Design Interviews",
      minutes: 11,
      intro: "Work through the creational, structural, and behavioral design patterns that come up most often in LLD interviews, each framed around the specific recurring problem it solves.",
      content: `## Why these patterns specifically

Design patterns are reusable solutions to recurring design problems — not rules to apply everywhere, but a shared vocabulary that lets you say "this needs a Strategy" instead of re-deriving the same solution from scratch, and instantly communicate the intent to anyone who knows the pattern. A handful of patterns account for the large majority of what actually shows up in LLD interviews, grouped into three families by what kind of problem they solve.

## Creational patterns: controlling how objects get created

**Singleton** — ensures a class has exactly one instance, globally accessible. Used when having more than one instance would be wrong or wasteful — a single shared configuration object, a single connection pool, a single logging instance.

\`\`\`java
class ConnectionPool {
    private static ConnectionPool instance;
    private ConnectionPool() {}

    public static ConnectionPool getInstance() {
        if (instance == null) instance = new ConnectionPool();
        return instance;
    }
}
\`\`\`

The problem it solves: preventing accidental duplication of something that must be unique. The trade-off worth knowing: singletons introduce global state, which makes testing harder and can hide dependencies — used correctly for genuinely singular resources, overused as a lazy substitute for proper dependency management.

**Factory** — delegates object creation to a dedicated method or class instead of calling \`new\` directly, so calling code doesn't need to know which concrete class to instantiate.

\`\`\`java
interface Notification { void send(String message); }
class EmailNotification implements Notification { public void send(String m) { /* ... */ } }
class SmsNotification implements Notification { public void send(String m) { /* ... */ } }

class NotificationFactory {
    static Notification create(String type) {
        return switch (type) {
            case "email" -> new EmailNotification();
            case "sms" -> new SmsNotification();
            default -> throw new IllegalArgumentException();
        };
    }
}
\`\`\`

The problem it solves: isolating "which concrete class do I create" so that adding a new notification type touches only the factory, never the code that calls it.

**Builder** — constructs a complex object step by step, avoiding a constructor with an unmanageable number of parameters (or a huge number of overloaded constructors for every combination of optional fields).

\`\`\`java
Pizza pizza = new Pizza.Builder()
    .size("large")
    .addTopping("mushroom")
    .addTopping("olive")
    .build();
\`\`\`

The problem it solves: objects with many optional fields becoming unreadable and error-prone to construct directly — the builder makes construction explicit and readable, and lets you validate the final object once, in \`build()\`.

## Structural patterns: composing objects and classes

**Adapter** — converts one interface into another that calling code expects, letting incompatible interfaces work together without modifying either side.

\`\`\`java
interface ModernPaymentAPI { void pay(double amountInCents); }

class LegacyPaymentSystem { void makePayment(String dollars) { /* ... */ } }

class LegacyPaymentAdapter implements ModernPaymentAPI {
    private LegacyPaymentSystem legacy;
    public void pay(double amountInCents) {
        legacy.makePayment(String.valueOf(amountInCents / 100));
    }
}
\`\`\`

The problem it solves: integrating a third-party or legacy component whose interface doesn't match what the rest of your system expects, without rewriting either the legacy system or your own callers.

**Decorator** — attaches new behavior to an object dynamically by wrapping it, as an alternative to subclassing every possible combination of features.

\`\`\`java
interface Coffee { double cost(); }
class PlainCoffee implements Coffee { public double cost() { return 2.0; } }

class MilkDecorator implements Coffee {
    private Coffee inner;
    MilkDecorator(Coffee c) { inner = c; }
    public double cost() { return inner.cost() + 0.5; }
}

Coffee order = new MilkDecorator(new PlainCoffee()); // cost() == 2.5
\`\`\`

The problem it solves: a combinatorial explosion of subclasses (\`CoffeeWithMilk\`, \`CoffeeWithMilkAndSugar\`, ...) — decorators let you stack independent behaviors at runtime instead.

**Facade** — provides a single, simplified interface in front of a complex subsystem with many interacting parts, hiding that complexity from callers who just want a straightforward operation.

The problem it solves: a client that needs to "book a trip" shouldn't have to know it involves separately coordinating a flight API, a hotel API, and a payment API — a \`TripBookingFacade.bookTrip()\` method hides that orchestration behind one call.

## Behavioral patterns: how objects interact and delegate

**Observer** — defines a one-to-many dependency where, when one object (the subject) changes state, all its registered observers are notified automatically. This is the pattern underneath pub/sub systems and event listeners.

\`\`\`java
interface Observer { void update(String event); }

class EventBus {
    private List<Observer> observers = new ArrayList<>();
    void subscribe(Observer o) { observers.add(o); }
    void publish(String event) {
        for (Observer o : observers) o.update(event);
    }
}
\`\`\`

The problem it solves: decoupling the thing that produces a change from the (possibly many, possibly changing) things that need to react to it, without the producer knowing anything concrete about its consumers.

**Strategy** — defines a family of interchangeable algorithms, encapsulates each one, and lets the algorithm be selected and swapped at runtime. This is exactly the same interface-based shape used for \`PaymentMethod\` earlier — the Strategy pattern is the general name for "the caller depends on an interface, and the concrete implementation is chosen elsewhere."

The problem it solves: an \`if/else\` or \`switch\` chain selecting between algorithms (sorting strategies, pricing strategies, compression strategies) gets replaced with pluggable classes, so adding a new strategy never means editing existing code — a direct application of the Open/Closed Principle.

**State** — lets an object change its behavior when its internal state changes, by delegating to a separate class representing each state, rather than a sprawling conditional checking "what state am I in" everywhere the behavior differs.

\`\`\`java
interface OrderState { void next(Order order); }
class PlacedState implements OrderState { public void next(Order o) { o.setState(new ShippedState()); } }
class ShippedState implements OrderState { public void next(Order o) { o.setState(new DeliveredState()); } }
\`\`\`

The problem it solves: state-dependent behavior scattered across conditionals throughout a class becomes fragile as more states are added — the State pattern isolates each state's behavior into its own class, so the object's core logic stays simple and each transition is explicit.

> **Key idea:** Creational patterns (Singleton, Factory, Builder) control how and when objects get created; structural patterns (Adapter, Decorator, Facade) control how objects and interfaces compose without forcing changes to existing code; and behavioral patterns (Observer, Strategy, State) control how objects interact and delegate — in every case, the pattern is the answer to one specific, recurring design pressure, and naming that pressure matters more in an interview than reciting the pattern's definition.`,
    },
  ],
}
