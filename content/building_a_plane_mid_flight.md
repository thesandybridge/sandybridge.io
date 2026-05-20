# The Plane We're Rebuilding

AI changed how I write code. It didn't change how anything downstream of code works. That's the whole problem.

Six months ago I was writing features at human pace. Read the ticket, think it through, build, test, ship, move on. Code review took a day or two. QA happened. PMs reviewed designs against output. It worked, more or less, at the speed everyone was operating at.

Now I'm generating code three to five times faster. The agent doesn't get tired. I don't lose context as easily when I have it on tap. Features that would have taken a sprint take days. So I keep moving. Next batch, next phase, stack the PRs, keep the queue full.

It's not just me. The engineers around me are doing the same thing. And they're shipping outside their old lanes. The backend engineer is now confidently touching frontend. The frontend engineer is opening backend PRs. The agent collapses the specialization barrier that used to gate who could even write code in a given area. So the volume isn't just higher per person. It's higher across more surface area, from more people, hitting the same downstream pipeline.

And then I look up and notice nothing else got faster.

Code review didn't get faster. QA didn't get faster. PMs reviewing the work didn't get faster. The bottleneck just moved. It used to be the engineer. Now it's everyone past the engineer in the pipeline. And because we're still producing at AI pace, the backlog at every downstream stage is growing.

It's worse than that, actually. Review used to be partially gated by capability. A frontend PR went to a frontend reviewer. A backend PR went to a backend reviewer. Now everyone is opening PRs across the stack, so the people doing review have to evaluate work in areas they don't own, made by people who don't own those areas either. The agent helps the author. It doesn't help the reviewer.

Here's what that looks like in practice. I ship a PR. It sits for a week because the reviewer is buried. By the time feedback comes back, I'm two or three branches deep into the next phase. Now I have to context-switch back to work I'd mentally closed, fix it, propagate the changes up the stack, and try to remember what I was doing on the current branch. The cost compounds. Rebases get fucked because I'm switching across branches that have all shifted under me. I lose hours to merge conflicts that wouldn't exist if the review cycle matched the build cycle.

The instinct is to blame the workflow. Smaller PRs. Better stacking tools. More discipline. I've tried all of that. None of it fixes the underlying problem, which is that the cadence mismatch creates the pain. The stack model assumes timely review. Without it, every cycle forces a context reload across multiple branches and the cost compounds.

Stacked PRs were optimized for human reviewer cognitive load. In a world where AI is in the loop and review is the bottleneck, that tradeoff inverts. Branches become context barriers. The agent loses scope across them. Automated review tools can't see the full feature. The thing that was supposed to make review easier makes the build harder.

So I started shipping bigger PRs. Not because it's "right" but because the system around me isn't honoring the contract that made small PRs worth the cost.

The bigger pattern, and this is the thing nobody is talking about, is that AI native isn't just a technical shift. It's an operational shift that most orgs haven't reckoned with. You can't 5x engineering throughput, collapse specialization barriers so everyone is shipping across the stack, and leave product, design, QA, and review at human pace and expect the system to work. The contradictions show up as backlog, as ambiguity about what "done" means, as moving goalposts, as engineers eating context-switching cost that nobody upstream sees.

The harder version of this: when product expectations are also unclear, AI velocity makes it worse, not better. If "done" is whatever the PM decides when they finally look at the dev link, and the PM is two weeks behind because they're doing four jobs, then shipping faster just means more stuff getting built against an undefined target. The output looks like progress. The reality is uncertainty being generated at scale.

What needs to happen is honest. Pick what gives. Either staff the downstream functions to absorb AI-paced output. Or lean fully into AI-augmented review and QA and accept that human review becomes lighter touch. Or slow engineering down to match pipeline capacity. Right now most orgs are picking none of these, implicitly, and the cost lands on whoever is closest to the work.

We're rebuilding the plane mid-flight. Some people are spending time on carpet patterns and cushion fabric while we lose altitude. Passengers are thinking about jumping out. The crew shipping the new wings is being told to move faster.

Move faster than what? Faster than the people who are supposed to land it. That's the actual question and almost no one is asking it out loud.
