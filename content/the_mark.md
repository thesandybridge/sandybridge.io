---
title: "The Mark"
date: 2026-04-02
description: "Agent tooling made us faster. We're spending the gains wrong."
tags: ["engineering", "ai", "opinion"]
---

# The Mark

**Agent tooling made us faster. We're spending the gains wrong.**

---

I can ship about twice as fast now with agent tooling. Most engineers I talk to say the same thing. That's not hype. That's Tuesday.

The obvious move is to double output. Ship more features, compress the roadmap, make the Gantt chart look heroic. Most orgs are going to do exactly that, and I think it's wrong.

## What actually changed

The bottleneck used to be implementation. You had the system in your head and the hard part was getting it out. Translating architecture into code. Fighting syntax. Context-switching between what you were *building* and what you were *typing*.

Agents collapsed that. Not because I type faster. Because the feedback loop got tighter. The distance between "I want it to work like this" and "does it?" is almost nothing now.

And when that happens, you stop spending time buried in code and start spending it *using* what you built. That's where quality comes from. Not clever abstractions. Not premature optimization. You use the thing. You feel the friction. You reshape it. Tight loops, over and over, until it works the way it should.

The more time you spend writing code, the less time you have to actually build something good.

## The resistance is identity, not logic

There's a lot of pushback against AI tooling right now. Some of it is legitimate — security, privacy, code ownership. Those are real concerns worth working through.

But most of it isn't that. Most of it is engineers who tied their identity to the act of writing code, and now that act is getting cheaper. That feels like a threat when coding is who you are. It doesn't feel like a threat when coding is just how you get the thing built.

What agent tooling actually did for me is open up the creative side of the work. When you're not grinding through implementation details, you're thinking about systems, interactions, how things feel. You're designing, not just executing. The job got more interesting, not less. But you have to be willing to let go of the part where you were the one typing every line.

## Estimation in the age of agents

This changes how we should estimate work, and nobody's adjusting for it.

The temptation is to cut timelines in half. But the moment everyone ships 2x faster, speed is table stakes. You're not ahead — you're just keeping up. And you're producing twice the surface area to maintain, twice the edge cases nobody tested, twice the features that *work* but don't *feel right*.

Keep delivery timelines roughly the same. Not because you're padding. Because you're putting the surplus into iteration. Living inside the feature. Using it the way a real person would. Fixing the stuff that's technically correct but feels off.

The roadmap looks the same. What ships is completely different.

It's worth splitting estimates explicitly — implementation time vs. hardening time. Implementation is the cheap part now. The expensive part is the iteration cycle, and that's where all the quality lives. If that time isn't visible and protected, it gets eaten by the next ticket every time.

## Interviewing hasn't caught up either

We're still interviewing engineers like the job is writing code under pressure. Timed CoderPad sessions. Whiteboard a sorting algorithm. Implement groupBy from memory in 30 minutes.

None of that maps to the actual job anymore. I don't write groupBy from memory on a Tuesday. I describe the shape of what I need and an agent writes it. Then I evaluate whether it's right, whether it fits the system, whether it handles the edges. The skill is knowing what to ask for and whether the output is good — not whether I can hand-write a reduce under a timer.

The engineers who are going to build the best software in the next five years are the ones who think in systems, have taste, and can evaluate output critically. We're filtering for none of that. We're filtering for who practiced leetcode last week.

## Where to spend it

Not everything gets this treatment. A settings page, a CRUD form, an admin panel — ship it, make sure it works, move on. Take the speed gain there. Free up the calendar.

But the features people actually touch every day, the ones that define how the product feels — those get the iteration budget.

Knowing which is which is the job. An agent can write the code, refactor it, test it. It can't sit in the chair and feel the 200ms delay that makes a transition sluggish. It can't decide that *this* interaction needs polish and *that* one is fine. It doesn't have a mental model of what the product should feel like.

That's taste. Agents don't have it. Probably won't for a while. And it's the thing that doesn't get commoditized when everyone has the same tools.

## The mark

You don't need a signature aesthetic or a design system to leave a mark on what you build. It's the pattern of decisions — what gets polish, what gets shipped as-is, where the time goes. People can feel it even if they can't name it.

Agent tooling didn't give anyone a new skill. It gave us room to use the ones we already had. The question is whether we spend that room shipping more, or shipping right.
