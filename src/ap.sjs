/*  
  $ap f(x, y, z)

  Desugared: f.ap(x).ap(y).ap(z)

  $ap (f(100))(x, y, z)

  Desugared: f(100).ap(x).ap(y).ap(z)
*/
macro $ap {
    case {_ $f:ident($x:expr (,) ...)} => {
        return #{
            $f $(.ap($x)) ...
        };
    }
    case {_ ($f:expr)($x:expr (,) ...)} => {
        return #{
            $f $(.ap($x)) ...
        }
    }
}

export $ap;
