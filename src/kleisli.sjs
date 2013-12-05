/*

    $kleisli (x, y, z) > m

    Desugars into:

    m.chain(x).chain(y).chain(z)

    Partial applied becomes

    var a = $kleisli (x, y, z)
    a(m)

    Desugars into:

    var a = function(m) {
        return m.chain(a).chain(b).chain(c)
    }
    a(m)

*/
macro $kleisli {
    case {_ ($x:ident (,) ...) > $m:expr} => {
        return #{
            $m $(.chain($x)) ...
        }
    }
    case {_ ($x:ident (,) ...)} => {
        return #{
            function(m) {
                return m $(.chain($x)) ...
            }
        }
    }
}