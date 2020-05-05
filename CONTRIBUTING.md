# General format
type(Component): Description

## Types
* feat - Added a new feature
* fix - Fixed something
* chore - Cleanup tasks
* refactor - Refactoring

## Description
Please start description with a capital letter and describe, what you did.

# Branching
Please follow git flows conventions.

## master
Holds the current release. You do not commit here!

## develop
Holds the current beta release. You do not commit here!

## feature/[name]
Here is where your work is done. To start a new Feature-branch simply run `git flow feature start [name]`.  If you finished your work, run `git flow feature finish` to automaticly merge your changes into develop.
