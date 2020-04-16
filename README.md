### Routes

| Verb      | Endpoint    
| ----------|-----------                                                                   |
| GET, POST | /users
| GET       | /users/:id
| GET       | /users/:id/comments
| GET, POST | /comments
| GET       | /comments/:id
| GET       | /comments/:id/poster

### Payloads

User

```
{
    name: <string>
    email: <string>
}
```

Comment

```
{
    posterId: <string>
    content: <string>
}
```
