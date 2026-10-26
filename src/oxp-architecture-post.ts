import type { Entry } from './data'

/** Source-audited October 26, 2026 engineering journal note. */
export const oxpArchitecturePost: Entry = {
  "slug": "the-openfork-network-behind-one-oxp-connection",
  "title": "The OpenFork network behind one OXP connection",
  "shortTitle": "One OXP connection, an entire agent harness",
  "contextLabel": "Engineering note / 012",
  "topic": "Engineering",
  "stage": "Working notes",
  "type": "Systems engineering",
  "date": "2026-10-26",
  "minutes": 18,
  "issue": "E-012",
  "figure": "system",
  "summary": "How OXP opens OpenFork's native tools, durable workers, configured MCP servers, and paired OFXP machines to ChatGPT, while OpenFork Sessions remain independent entry points into the same system.",
  "keywords": [
    "OpenFork",
    "OXP",
    "OFXP",
    "MCP",
    "Agent harness",
    "Agent delegation",
    "System architecture",
    "Native tools",
    "Multi-agent systems",
    "Peer exchange"
  ],
  "sections": [
    {
      "heading": "The problem with stopping at computer automation",
      "paragraphs": [
        "I have built computer-automation tools before. My localMCP projects, along with tools in the same general category as Chat on Steroids, give an external agent a way to inspect files, execute commands, and interact with a machine. They solve a real problem: an agent in one environment needs to do useful work in another. I still like that approach.",
        "But I kept getting more interested in what was on the other side of the connection. I already had OpenFork, my fork of OpenCode, and it was becoming a substantial agent harness in its own right. OpenFork has Sessions, native tools, model and account routing, workers, durable state, its own integrations, and a local execution runtime. Why reduce all of that to a generic remote shell?",
        "OXP is my answer to that question. It gives an already-running agent, such as ChatGPT, an authorized entry into the capabilities OpenFork already owns. I can ask ChatGPT to use the same underlying project inspection, symbol analysis, editing, testing, and other services that OpenFork's own agents use. From there, the architecture extends into worker delegation, configured MCP servers, and other OpenFork machines through OFXP. There is one OXP connection from ChatGPT, but considerably more than one route through the system."
      ]
    },
    {
      "heading": "OpenFork is an agent harness, even when OXP is absent",
      "paragraphs": [
        "I think this is the most important part of the diagram. OpenFork isn't a desktop wrapper that waits for ChatGPT to do the reasoning. I can open a manual OpenFork Session, select the agent and model I want, give it a task, and let that Session use its own tools. Workers and native Sessions have their own execution identities and lifecycles.",
        "The application has a newer interface, but the mature V1 Session and tool runtime remains the production execution path that I've chosen to maintain and extend. The desktop host and local sidecar own the work, with shared domain services providing storage, tools, supervision, and other capabilities. The UI is a way to interact with those services, not their implementation.",
        "This gives the system several legitimate entry points. A person can work in OpenFork directly. An editor can reach an OpenFork-backed Session through a supported ACP route. Native Sessions can run their tool loops or use Code Mode. ChatGPT can enter through OXP. A different OpenFork installation can address approved capabilities over OFXP. Each path has a distinct caller and permission boundary, but the objective is to converge on the same authoritative behavior."
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
      "heading": "One connector, many operations",
      "paragraphs": [
        "From ChatGPT, OXP looks like one connection to OpenFork. Behind it, I can inspect and modify code in approved workspaces, search the native capability catalog, describe a specialized operation only when it is needed, invoke that operation, supervise existing Sessions, and delegate new workers. I can also reach OpenFork-configured MCP tools and, where paired and granted, remote machines through the OFXP adapter.",
        "The connection is an MCP interface, but its payload is the OpenFork harness. OXP has direct tools for common operations and a progressive capability broker for the long tail. The broker can list compact capabilities, describe the schema for the one operation I need, and then call it. Code Mode offers another route for composing authorized operations without dumping every tool schema and intermediate result into the parent model's context.",
        "There is a good engineering reason for the shape of this interface. Tool definitions consume context and compete with the material the model is trying to reason about. Exposing every native action, every MCP tool, and every optional subsystem eagerly would make the system harder to use. Keeping discovery compact means the breadth of the underlying runtime doesn't have to become a permanent context penalty."
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
        "If instead I am already in a manual OpenFork Session, I can perform the corresponding local work directly. I can invoke native tools, use my configured MCP integrations, and address paired OFXP machines through the Session's own model-facing interface. ChatGPT isn't the origin of every operation. That symmetry is the system design I wanted."
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
      "heading": "Why I find this architecture beautiful",
      "paragraphs": [
        "I have always liked systems in which a small number of clearly defined interfaces gives access to a much larger composition of capabilities. In this case, each piece has a job. OpenFork is the agent harness and execution runtime. OXP gives an existing external agent access to that runtime. MCP is a general tool protocol that OpenFork both consumes and uses at the OXP boundary. OFXP connects distinct OpenFork installations as authenticated peers. Native Sessions and workers are first-class participants rather than subordinate artifacts created by a remote-control wrapper.",
        "Those distinctions make the combinations possible. I can begin in ChatGPT and reach OpenFork's own tools, delegate a worker, use an already-configured MCP integration, and access approved capabilities on another computer. I can begin in a manual OpenFork Session and reach many of the same underlying services, with its own native authority and context. I can add another OpenFork machine without teaching ChatGPT the entire new machine's tool inventory or turning every workspace into one shared filesystem.",
        "The especially satisfying part is the recursive engineering constraint: each new route ought to use the same real domain owner instead of creating another implementation. Every additional entry point puts pressure on me to make the boundaries and ownership clearer. That's an architecture worth continuing to build."
      ]
    }
  ]
}
