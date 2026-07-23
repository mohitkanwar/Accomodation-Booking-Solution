---
title: Organisation Hierarchy
sidebar_position: 2
---

# Organisation hierarchy

```text
Sodexo B2C Platform
  └── Client / tenant
       ├── Client administrators
       ├── Operators and supervisors
       └── Employees
            └── Employee travel profile
                 ├── Role level
                 ├── Department
                 ├── Cost centre
                 └── Manager
```

Travel entitlement is resolved within the client boundary using employee level
and destination. Every business entity and query is scoped by `client_id`.
