![Image of travis-ci](https://travis-ci.org/dustin71728/simple-randstring.svg?branch=master)

# simple-randstring
Create random strings fast

# Usage:

```javascript
import { randomString } from 'simple-randstring'

// Use Math.random() to create random strings, fast but not secure
// Default charset is [0-9a-zA-Z]
randomString(30)

// Use window.crypto( on the browser ) or crypto( on node ) to create random strings
// The speed is only half compare to Math.random() but it is more secure
// If window.crypto is not supported , it will fall back to use Math.random()
randomString(30, true)
```

```javascript
import { randomString, setRandCharset } from 'simple-randstring'

// Define your own charset
setRandCharset('abcdefg()!@#$%')

// Return something like ')ag)(#fbe@!a%g%$g(b#'
randomString(20, true)
```
