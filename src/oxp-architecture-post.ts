import type { Entry } from './data'

/** Source-audited October 26, 2026 engineering journal note. */
export const oxpArchitecturePost: Entry = {
  "slug": "the-openfork-network-behind-one-oxp-connection",
  "title": "OpenFork: connecting the systems around an agent harness",
  "shortTitle": "The interconnected OpenFork",
  "contextLabel": "Engineering note / 012",
  "topic": "Engineering",
  "stage": "Working notes",
  "type": "Systems engineering",
  "date": "2026-10-26",
  "minutes": 18,
  "issue": "E-012",
  "figure": "system",
  "summary": "I forked OpenCode and expanded its abilities tenfold by connecting its agents, native tools, delegated workers, MCP integrations, ChatGPT through OXP, and other OpenFork machines through OFXP.",
  "keywords": [
    "OpenFork",
    "OpenCode",
    "OXP",
    "OFXP",
    "MCP",
    "Interconnected systems",
    "Agent harness",
    "Agent delegation",
    "Native tools",
    "Peer exchange"
  ],
  "sections": [
    {
      "heading": "I took OpenCode and kept connecting things to it",
      "paragraphs": [
        "I took OpenCode, forked it into OpenFork, and expanded its abilities tenfold by interconnecting other systems with it. OpenCode was already a capable agent harness. Its agents, Sessions, tools, models, and execution loop were the foundation I wanted to build upon. What excites me about OpenFork is how far that foundation can extend when the systems surrounding it are connected.",
        "I had already worked on computer-automation projects such as localMCP, where an external agent can inspect files or execute operations on another machine. OpenFork gave me a different opportunity: I could connect an external agent to an entire existing agent environment, with its own working Sessions, customized engineering tools, integrations, and persistent workers. I could make those abilities accessible across systems while retaining the native ways of using them.",
        "The result is a network of paths, not a single chain of tools. ChatGPT can enter through OXP, inspect an existing OpenFork Session, delegate a new worker, run an OpenFork tool directly, invoke a configured MCP integration, or reach an authorized OFXP peer. A native OpenFork Session can use its own tools, MCP integrations, and paired peers without going through ChatGPT. The part I find beautiful is the overlap: these are independent systems with deliberate connections between them."
      ]
    },
    {
      "heading": "OpenCode was the foundation; interconnection was my expansion",
      "paragraphs": [
        "OpenCode already had the essential structure of an agent harness. Forking it meant I could work from a real Session runtime rather than invent a new one. I then extended OpenFork with specialized tools, model and account routing, richer worker and Session controls, Code Mode capabilities, and interfaces to other systems. The engineering interest is in how those extensions interact.",
        "Imagine drawing OpenFork as a network instead of an application window. OXP has several outbound connections: one to the native tool surface, one to existing Sessions for inspection and control, one to delegation for creating worker Sessions, one to the MCP integrations OpenFork can use, and one to OFXP for reaching another machine. Each connection has its own operation and authority checks. They are different routes into capabilities that can be combined in one task.",
        "A native Session is another participant in that network. It can use the native tools, access appropriately configured MCP servers, and address paired OFXP machines. An OXP-delegated worker becomes a real native Session, able to continue through its own authorized execution path. I care about making those paths converge on shared implementations because it means every new connection extends the whole system instead of becoming another isolated integration."
      ]
    },
    {
      "heading": "How my custom tools cross the boundary",
      "paragraphs": [
        "One of my favorite parts is the native tool exposure. Consider the Project tool. It can identify repository structure, package scripts, toolchains, and entry points without making the agent reconstruct that information through an entire conversation's worth of shell commands. The Symbols and LSP paths address definitions, usages, and code structure. Read, grounded Edit, Git, Typecheck, and Test cover much of the engineering loop. I have spent a lot of effort making those tools recoverable, bounded, and useful to a model rather than merely convenient to a human.",
        "When a native OpenFork agent calls a tool, it has a real Session and a legitimate native tool context. ChatGPT entering through OXP is a different caller. The OXP adapter projects the relevant operation through an approved root and its external authorization, while the domain service still produces the result. For example, native project inspection and OXP's project capability reuse the ProjectInspection producer. The toolchain operation shares its underlying probes; OXP adds its own checks and redaction for host-specific paths. The logic that understands the repository doesn't need a second implementation just because the request came from ChatGPT.",
        "This is also why I care so much about executable tool parity. A name in a catalog is not a working tool. OpenFork maintains a native registry, a mapping for supported external semantics, and dispatcher-backed tests. If a new native tool should be accessible through OXP, that exposure needs a real callable operation or a documented reason that the external principal cannot perform it. The same engineering standard extends across native Sessions, Code Mode, OXP, OFXP, ACP, and supported MCP-facing surfaces. Actual permissions and Session ownership remain specific to each route."
      ]
    },
    {
      "heading": "One OXP connector, several connected systems",
      "paragraphs": [
        "The diagram is easiest to understand by following connections outward from OXP. From ChatGPT I can call OpenFork tools directly; inspect, prompt, or stop authorized existing Sessions; delegate durable worker Sessions; discover and call configured MCP integrations; and invoke permitted capabilities on other OpenFork hosts through OFXP. These aren't five stages of one workflow. They are five different paths that I can choose and combine as the task changes.",
        "Native OpenFork agents sit beside that external access. A native Session can call the same underlying engineering services under its own permissions, reach its available MCP integrations, and interact with OFXP peers. When OXP starts a worker, the worker is a native Session, so the same native execution environment becomes available to the delegated task. This is the interconnection I want the figure to express: overlapping reachability, distinct callers, and real shared services.",
        "I built compact tool discovery into OXP because the breadth of that network should not consume the whole model context at once. Direct operations cover everyday work, while a capability broker can identify and describe specialized calls when needed. The connections remain available without eagerly exposing every tool schema."
      ]
    },
    {
      "heading": "Delegation creates a second, durable center of activity",
      "paragraphs": [
        "OXP also lets ChatGPT start real OpenFork workers. When I delegate an investigation or implementation, OpenFork creates a native worker Session with its own task, model selection, runtime execution, and durable identity. The worker isn't ChatGPT continuing to push simulated shell commands across the tunnel. It is an agent executing inside OpenFork.",
        "That distinction becomes useful when the initiating conversation can't keep issuing tools. A ChatGPT parent connection can be time-bounded, while an OpenFork worker has a native lifecycle that can outlast an individual exchange with the parent. I can inspect the worker through Session supervision, review its history and results, and control it through the authorized Session/worker interfaces. Batches and source-conversation grouping preserve meaningful task titles rather than throwing every delegated worker into an anonymous global bucket.",
        "Delegation is not the only multi-agent system inside OpenFork, either. The native Swarm domain coordinates several Sessions with its own tasks, assignments, messages, and progress. OXP can expose authorized Swarm coordination without manufacturing a Session to represent ChatGPT. To me, this is where the architecture becomes interesting: the external agent can request and supervise work, while the harness remains responsible for actual agents, their state, and their execution."
      ]
    },
    {
      "heading": "OpenFork's MCP servers become available on demand",
      "paragraphs": [
        "OpenFork itself can consume external MCP servers. A manual Session can use MCP integrations configured for its workspace. That makes MCP another source of capabilities for the harness, alongside OpenFork's native tools. OXP provides a separate authorized route to those configured MCP tools: discover an integration, load its tool contract when needed, and invoke the selected operation under the correct workspace and integrations grant.",
        "I've also been working on a specific friction point: disabled-by-default MCP servers. I don't want every server to connect at startup or dump its tools into every Session just in case they might be useful later. In the current source, the new mcp.manage capability gives OXP an explicit way to inspect configured servers, activate one in a transient OXP-owned client pool, use tools through namespace=mcp, and release it. Idle connections are reclaimed, and a transient OXP activation does not rewrite the user's configured enabled state or silently add its tools to native Sessions.",
        "Native agents have a related but separate path. A native Session can discover mcp.manage through Code Mode, activate a configured server with the native permission and ownership rules, and make its tools available to native Sessions without eagerly including every schema. The recent implementation is committed in the OpenFork source; the live host still needs to run a build containing those commits before I can treat this new behavior as deployed. I like that the two paths share an MCP service but maintain separate connection ownership. An external request should not quietly alter what a native agent thinks is connected."
      ]
    },
    {
      "heading": "OFXP turns another OpenFork installation into a peer",
      "paragraphs": [
        "OFXP stands for OpenFork Exchange Protocol. This is where the architecture stops being one computer with several interfaces. Imagine my main machine running OpenFork and a second OpenFork installation somewhere else on the local network. A native Session on Machine A can reach Machine B through OFXP. ChatGPT can reach the same peer route by entering Machine A through OXP and invoking the OXP ofxp capability.",
        "Machine B remains its own OpenFork installation, with its own Sessions, workspaces, tools, and authority. OFXP is not a remote-server setting that makes B replace A as the application's backend. A remains the runtime for the initiating Session; B supplies selected remote operations under an authenticated peer relationship. The target machine independently decides which roots and capabilities the other machine may access.",
        "The pairing model reflects that distinction. Network discovery finds possible peers; the two operators compare and confirm a short authentication string to establish identity; capability grants and approved roots are separate choices. The connection uses an authenticated peer transport and enforces the remote grant at execution. A remembered peer address isn't a permission, and an authorized path into Machine A cannot silently become unrestricted access to Machine B."
      ]
    },
    {
      "heading": "What can actually cross an OFXP connection",
      "paragraphs": [
        "The executable OFXP path is already more substantial than file access. Its capability dispatcher can expose approved-root read, write, Git, process, integration, browser, and other supported operations. It has bounded remote Session discovery and inspection, including lists, messages, children, and search, subject to the remote Session-supervision grant.",
        "Additional explicit grants allow the remote caller to interact with an existing Session: pause or resume it, send or steer a turn, select a model, read or change its todo state, and perform certain lifecycle operations. The remote request path can also surface and settle Session permissions or questions when request supervision is granted. A mutation travels through a receipt mechanism so a lost reply does not encourage the caller to execute the same action blindly. The OXP gateway preserves ChatGPT's external provenance rather than converting it into a fictional local Session on the peer.",
        "There is a meaningful implementation boundary today. OFXP does not yet provide its own durable remote-worker delegation or peer-to-peer messaging dispatcher. Those are separate lifecycles from the OXP worker system, and their identity, delivery, cancellation, and ownership need their own implementations. My preferred diagram shows the executable remote capabilities and supervision as solid routes, with remote worker creation and peer messaging indicated as planned edges. That is a better picture of the system than hiding its current frontier."
      ]
    },
    {
      "heading": "A concrete way the pieces fit together",
      "paragraphs": [
        "Suppose I am in ChatGPT discussing a difficult problem in a repository on my main machine. Through OXP, I can inspect the repository with OpenFork's Project and Symbols services, ask for a bounded code read, and run a focused test. If I want a separate agent to work on a defined implementation or audit, I can delegate a real OpenFork worker rather than asking ChatGPT to emulate another agent through repeated terminal commands.",
        "Now suppose that another OpenFork machine has a different authorized workspace or an existing Session I want to inspect. I can use the same OXP connection to list the paired OFXP peer's available capabilities, then inspect the remote Session or invoke an allowed operation there. The request crosses two boundaries: ChatGPT to OXP on Machine A, and Machine A to OFXP on Machine B. Both boundaries retain their caller identities and grants. If the remote Session has authority to continue work on B, I can supervise its real work without treating the two installations as one database.",
        "Starting the same work from a manual OpenFork Session follows another route through the network. The native agent can use its tools, reach its configured MCP integrations, and address permitted OFXP peers directly. If a worker was spawned through OXP, it has become part of that native Session environment too. Different starting points can lead to overlapping capabilities without erasing who initiated the work."
      ]
    },
    {
      "heading": "The permission system is part of the architecture",
      "paragraphs": [
        "I care about architectural elegance, but this system would be much less interesting if its convenience depended on inventing permissions. OpenFork distinguishes a native Session, an OXP connector, and an authenticated OFXP peer as different principals. It distinguishes a workspace root from a Session ID, a discovered capability from an authorized action, and a paired identity from an approved remote workspace.",
        "An OXP connection has its own grants for reading, writing, processes, integrations, delegation, and supervision. Its local Session-supervision scope can cover authorized native Sessions independently of project-root file grants. OFXP adds another authority check on the remote machine, including separately granted Session control. The effective permission is the intersection of the boundaries the action crosses. A peer cannot expand its rights by asking a different model or by routing a request through a broker.",
        "The same discipline applies to the implementation itself. OpenFork's architecture contract requires one authoritative owner for a capability, compact and lazy catalogs, explicit execution checks, revocation enforcement, and receipts where a retry could duplicate a mutation. I like that these are architectural properties. They're what let multiple entry points remain coherent instead of growing into disconnected piles of special-case glue."
      ]
    },
    {
      "heading": "Why connecting these systems feels beautiful to me",
      "paragraphs": [
        "I keep coming back to the fact that I started with OpenCode. It was already an established agent harness with serious capabilities, and I treated it as a foundation for connecting much more. Through OpenFork, I expanded its abilities tenfold by making other systems part of the same working environment. That interconnection is the part that feels badass to me.",
        "OXP is one connection in the network, but it reaches a surprising amount: direct tools, existing Sessions, delegated workers, configured MCP integrations, and paired OFXP machines. OpenFork's native Sessions have their own paths to tools, integrations, and peers. Delegated workers can carry on as real Sessions. The moment one agent can hand off work, inspect another Session, or use a tool on another authorized machine without rebuilding the whole workflow is the moment the relationships between the pieces matter.",
        "I love the engineering constraint behind it: the more entry points I connect, the more important it becomes for them to use shared underlying implementations and retain their own permissions. Every connection increases what I can do with the existing pieces. I can start in different places, cross several systems, and still understand who is doing the work, which machine owns it, and how to control it. That's the OpenFork architecture I wanted to build."
      ]
    }
  ]
}
