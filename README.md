# buildhub
API for creating and sharing character builds for D&D
# Technology Stack
Node.js, Express.js, Firebase, Git
# Database
For this project I'm using NOSql database based on Firebase. This decision was made because character builds in D&D don't have any strict structure because of in-game leveling system. Also, Firebase has excellent authorization system. With its password saving system it's very easy to create secure authorization.
## Database Collections
### users 
Related to UID. This collection contains information about users, they can change (nickname, bio, etc.);
### builds 
Contains technical information about builds (name, description, author, etc.);
### builds/levels 
Contains the major content of the build (class, subclass, spells, etc.) taken for each level.
### builds/comments
Contains comments, users write to the builds
### builds/comments/replies 
Replies to the comments
### builds/likes 
Liking system for builds
# Key Backend Features
User can do any action only if they are authorized. If user post a like - system checks if it exists or not. If yes - then it removes existing like. If no - then it adds a like. When user requests all builds, the API will give only the basic information about the build and amount of likes, but when user requests exact build - the API will show The whole information abut the build including build, levels, and comments. This was made to make request more optimized and API more responsive.
