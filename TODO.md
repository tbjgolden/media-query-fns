new aim

let the algorithm solve each node

known issues with this plan:

- the ast doesn't allow us to see the raw general enclosed node
- atm my plan is to just return 'true' 'false' or 'unknown' but it would be nice to return an ast
  with each node with an extra bit of metadata containing that node's result (and reason if
  possible)

---

things we'd love to do with media queries

---

- isValid
  - any of the known media types
  - no unknown features
    - all features can be boolean
    - otherwise feature values/units are checked
    - but negative values for non-negative concepts are allowed
  - general enclosed supported
- isUseful
  - only all, print or screen
  - like isValid except:
    - do not allow general enclosed
- isSensible
  - like isUseful except:
    - checks media query values are not out of bounds
      - i.e. if a feature is false in the negative range but is written in a way that suggests the
        author is trying to test it with a negative number
    - allows only boolean features that make sense
- isVariable
  - evaluation will not always be true or false

analysis

- getSimplerForm()
  - similar logic as english
  - remove redundant parens
  - prefer boolean syntax then range syntax

manipulation

- traverse(fn)
- traverseMap(fn)
- toCompatQuery()

separate project

- browser support tables
