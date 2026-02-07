# Scenario Logic: Act 6 - The Finale

```mermaid
flowchart TD
    Start((Start: Super SysOp)) --> Boss{Boss: The Coordinator}
    
    Boss -->|Check Karma| GoodEnding[Good Ending: Coordinator Status]
    Boss -->|Check Fame| LegendEnding[Legend Ending: Network Founder]
    Boss -->|Fail Check| BadEnding[Bad Ending: Excommunication]
    
    GoodEnding --> Credits
    LegendEnding --> Credits
    BadEnding --> GameOver
```
