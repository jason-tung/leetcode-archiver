# Todo

I think the only thing left is to add a popup for feedback but idrc about that rn

Maybe send a webhook to discord

-   ~make it work~ yeah nah the docs are so bad it's not even funny
-   ~pad with zeros and rearchive~
-   cache data on page load so can submit from submissions tab
-   upload files to a server & autocommit

rough design:
instead of a chrome download -> post the data serverside
something like:
{
passphrase,
text,
filename
}
sent webhook updates with discord? or something?
serverside will write to file and save
execute git commands from server
git add ~/leetcode
git commit with date and difficulty/name
push
