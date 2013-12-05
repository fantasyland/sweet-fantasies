var λ = require('fantasy-check/src/adapters/nodeunit'),
    Identity = require('fantasy-identities');

function identityM(x) {
    return Identity.of(x);
}

exports.kleisli = {
    'chain values': λ.check(
        function(a) {
            var s = $kleisli (identityM, identityM) > Identity.of(a);
            return s.x === a;
        },
        [String, String]
    ),
    'deferred chain values': λ.check(
        function(a) {
            var s = $kleisli (identityM, identityM),
                x = s(Identity.of(a));
            return x.x === a;
        },
        [String, String]
    )
};
