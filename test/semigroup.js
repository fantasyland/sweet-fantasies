var λ = require('fantasy-check/src/adapters/nodeunit'),
    Option = require('fantasy-options');

exports.semigroup = {
    'concats values': λ.check(
        function(a, b) {
            var x = Option.of(a),
                y = Option.of(b),
                s = $semigroup (x + y);
            return s.x === a.concat(b);
        },
        [String, String]
    )
};
