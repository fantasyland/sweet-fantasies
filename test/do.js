var λ = require('fantasy-check/src/adapters/nodeunit'),
    Identity = require('fantasy-identities');

exports.donotation = {
    'chains computations': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                return x + y
            }.map(function(a){ return a });
            return sum.x === a + b;
        },
        [String, String]
    ),
    'supports var-bindings': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                var k = 'do'
                y <- Identity.of(b)
                return x + y + k
            }
            return sum.x === a + b + 'do';
        },
        [String, String]
    ),
    'supports var-bindings as tail 1': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                var k = 'do'
                return x + y + k
            }
            return sum.x === a + b + 'do';
        },
        [String, String]
    ),
    'supports var-bindings as tail 2': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- $do {
                  y <- Identity.of(b)
                  return y
                }
                var k = 'do'
                return x + y + k
            }
            return sum.x === a + b + 'do';
        },
        [String, String]
    ),
    'supports var-bindings as tail 3': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                Identity.of(100)
                var k = 'do'
                return x + y + k
            }
            return sum.x === a + b + 'do';
        },
        [String, String]
    ),
    'binding name is optional': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                Identity.of(100)
                y <- Identity.of(b)
                return x + y
            }
            return sum.x === a + b;
        },
        [String, String]
    ),
    'supports simple if-expressions': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                var z = y
                if (x === a) return x + z else return ''
            }
            return sum.x === a + b;
        },
        [String, String]
    ),
    'supports simple if-else-expressions': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                if (x !== a) return x + y else return ''
            }
            return sum.x === '';
        },
        [String, String]
    ),
    'supports if-else-expressions': λ.check(
        function(a, b, c) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                var z = y
                if (x === a) $do {
                    z <- Identity.of(c)
                    return x + z
                } else $do {
                    z <- Identity.of('')
                    return x + z
                }
            }
            return sum.x === a + c;
        },
        [String, String, String]
    ),
    'supports return then if-else-expressions': λ.check(
        function(a, b, c) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                var z = y
                return if (x === a) $do {
                    z <- Identity.of(c)
                    return x + z
                } else $do {
                    z <- Identity.of('')
                    return x + z
                }
            }
            return sum.x.x === a + c;
        },
        [String, String, String]
    ),
    'supports if-expressions after non-bound expression': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                Identity.of(100)
                if (x === a) return x + y else return ''
            }
            return sum.x === a + b;
        },
        [String, String]
    ),
    'supports return then if-expressions after non-bound expression': λ.check(
        function(a, b, c) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                return if (x === a) $do {
                    z <- Identity.of(c)
                    return x + z
                } else $do {
                    z <- Identity.of('')
                    return x + z
                }
            }
            return sum.x.x === a + c;
        },
        [String, String, String]
    ),
    'supports nested do-blocks': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- $do {
                    z <- Identity.of(b)
                    return x + z
                }
                return x + y
            }
            return sum.x === a + a + b;
        },
        [String, String]
    ),
    'supports nested do-blocks': λ.check(
        function(a, b, c) {
            var sum = $do {
                x <- Identity.of(a)
                var z = 100
                y <- $do {
                    z <- Identity.of(b)
                    return x + z
                }
                z <- Identity.of(c)
                return x + y + z
            }
            return sum.x === a + a + b + c;
        },
        [String, String, String]
    ),
    'supports an action as the last expression': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- Identity.of(b)
                Identity.of(x + y)
            }
            return sum.x === a + b;
        },
        [String, String]
    ),
    'supports multiple returns': λ.check(
        function(a, b, c) {
            var sum = $do {
                x <- Identity.of(a)
                return b
                return c
            }
            return sum.x === c
        },
        [String, String, String]
    ),
    'supports return in a binding expression': λ.check(
        function(a, b) {
            var sum = $do {
                x <- Identity.of(a)
                y <- return b
                return x + y
            }
            return sum.x === a + b
        },
        [String, String]
    )
};
