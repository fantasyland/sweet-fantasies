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
    case {_ ($x >=> $e ...) > $y:expr $rest ... } => {
        return #{
            function(a) {
                return $x(a) $kleisli {$e ...}
            }($y)
            $rest ...
        }
    }
    case {_ ($x >=> $e ...) $rest ... } => {
        return #{
            function(a) {
                return $x(a) $kleisli {$e ...}
            }
            $rest ...
        }
    }
    case {_ {$x >=> $y ...}} => {
        return #{
            .chain($x) $kleisli {$y ...}
        }
    }
    case {_ {$x}} => {
        return #{
            .chain($x)
        }
    }
}

export $kleisli
