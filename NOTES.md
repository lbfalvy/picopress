# PicoPress principles

- everything in a file
- object types optionally associated with a body
- object types optionally dynamically loaded
- object types generate instance files
- object types render a web editor
- object types provide static type checking
- object types optionally define routes
- object types optionally define RSS entries

# Approach

**Traits** are capabilities, like types in a programming language,
but they aren't structural. They define
- a `runtype` datatype for values of this capability
- ? a web debug impl

**Sources** are ways to collect Entities of a given Trait. They define
- retrieving all Entities
- retrieving an entity with a particular URN
- retrieving Entities matching a filter *(TODO)*

**Stores** are editable clusters of Entities of a given Trait,
and define
- a Source
- Entity editing functions (create new, save updates, delete)
- ? a web editor

**Templates** are file system Stores, located in the folder with the
Trait's name with the name `+collection.tsx`

**Impls** are the ability of a Trait to represent another
- 

**Entities** are values that implement a single Trait

Notes
- In the case of code-bound Entities, it is very plausible for their
  native Trait to be unique to the Entity.
- Most Template Traits will only provide Impls, not offer their own
  operations.
- When Entities represent Traits other than their native, the
  representation with the fewest Impl translations wins.
- Routes and RSS are Traits, the body and the dynamic loading are in
  the Template's area of responsibility 

# TODO

filtering