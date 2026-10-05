# Server counter system

Use the Lightcore setup panel to choose which counters are enabled and their templates.

Supported placeholders:
- {count}

Supported live counters:
- Members
- Humans
- Bots
- Channels
- Roles
- Boosts
- In Voice

The updater should run after member, channel, role and boost changes and periodically as a reconciliation pass.
