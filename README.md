# Final Project Template

## Getting started

When setting up the project for the first time, you'll need to:

* Download the template as a ZIP archive, unarchive it, and save it somewhere on your computer. You'll probably want to rename the project directory from "final-project-template-master" to something that's appropriate for your project.
* `cd` into the project directory.
* Run `git init` to make it a git repository.
* Let's make our first commit! `git add -A` and then `git commit -m "Initial commit"`.
* On GitHub, let's create a new remote repository by going to "New repository" in the "+" menu in the upper right hand corner of GitHub.
* Give your repository an appropriate name, probably similar to the directory name you used above, and a description.
* The defaults are fine for the other fields.
* We now run the commands in the "...or push an existing repository from the command line" example shown on the resulting page.

## Running a local server

If you haven't yet installed [reload](https://www.npmjs.com/package/reload) globally, run `npm install -g reload'.

After that, any time you want to work on your project, run `reload -b` from the project directory, perhaps in a second tab so you can continue to use git. (If it doesn't work, it could be a port conflict, so you might try specifying a different port like this: `reload -b -p 4567`.)
