var λ = require('fantasy-check/src/adapters/nodeunit'),
    Identity = require('fantasy-identities');

exports.applicatives = {
    'applies applicatives': λ.check(
        function(a, b) {
            var f = Identity.of(function(x) { return function(y) { return x+y }}),
                x = Identity.of(a),
                y = Identity.of(b),
                s = $ap f(x, y);
            return s.x === a + b;
        },
        [Number, Number]
    ),
    'supports nesting': λ.check(
        function(a, b) {
            var f = Identity.of(function(x) { return function(y) { return x+y }}),
                x = Identity.of(a),
                y = Identity.of(b),
                s = $ap f(x, $ap f(x, y));
            return s.x === a + a + b;
        },
        [String, String]
    ),
    'supports inline creation of applicative': λ.check(
        function(a, b) {
            var x = Identity.of(a),
                y = Identity.of(b),
                s = $ap (Identity.of(function(x) { return function(y) { return x+y }}))(x, y);
            return s.x === a + b;
        },
        [Number, Number]
    )
};
