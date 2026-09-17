# Project statechart

This is an optional high-level visual. Detailed truth remains in the tracker and project log.

```mermaid
stateDiagram-v2
    [*] --> TODO
    TODO --> DOING
    DOING --> DONE
    DOING --> BLOCKED
    BLOCKED --> DOING
    DONE --> [*]
```

