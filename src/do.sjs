/*
   $do {
     x <- foo
     y <- bar
     z <- baz
     return x * y * z
   }

   Desugars into:

   foo.chain(function(x) { 
     return bar.chain(function(y) { 
       return baz.map(function(z) { 
         return x * y * z 
       }) 
     })
   })

   var-bindings are supported too:

   $do {
     x <- foo
     k = 10
     y <- bar(x)
     z <- baz
     return x * y * z * k
   }

   Variable binding is optional if monad is executed just for its effects:

   $do {
     putStrLn("Hello friend! What's your name?")
     name <- readLine()
     return name
   }

   TODO:
  
    - do not require last expression to be 'return'

*/
macro $do {
    case {_ {$a:ident <- $do { $doBlock ... } var $($x:ident = $y:expr) (var) ... return $b:expr }} => {
        return #{
            function() {
                var ma = $do { $doBlock ... }
                return ma.map(function($a) {
                    $(var $x = $y;) ...
                    return $b
                });
            }()
        };
    }
    case {_ {$a:ident <- $do { $doBlock ... } return $b:expr }} => {
        return #{
            function() {
                var ma = $do { $doBlock ... }
                return ma.map(function($a) {
                    return $b
                });
            }()
        };
    }
    case {_ {$a:ident <- $do { $doBlock ... } $rest ... }} => {
        return #{
            function() {
                var ma = $do { $doBlock ... }
                return ma.chain(function($a) {
                    return $do { $rest ... }
                });
            }()
        };
    }
    case {_ {var $($x:ident = $y:expr) (var) ... $rest ... }} => {
        return #{
            function() {
                $(var $x = $y;) ...
                return $do { $rest ... }
            }()
        };
    }
    case {_ {$a:ident <- $ma:expr var $($x:ident = $y:expr) (var) ... return $b:expr }} => {
        return #{
            $ma.map(function($a) {
                $(var $x = $y;) ...
                return $b;
            });
        };
    }
    case {_ {$a:ident <- $ma:expr return $b:expr }} => {
        return #{
            $ma.map(function($a) {
                return $b;
            });
        };
    }
    case {_ {$a:ident <- $ma:expr var $($x:ident = $y:expr) (var) ... return if $rest ...}} => {
        return #{
            $ma.map(function($a) {
                $(var $x = $y;) ...
                $ifelsedo { if $rest ... }
            });
        };
    }
    case {_ {$a:ident <- $ma:expr return if $rest ...}} => {
        return #{
            $ma.map(function($a) {
                $ifelsedo { if $rest ... }
            });
        };
    }
    case {_ {$ma:expr var $($x:ident = $y:expr) (var) ... return $b:expr}} => {
        return #{
            $ma.map(function() {
                $(var $x = $y;) ...
                return $b;
            });
        };
    }
    case {_ {$ma:expr return $b:expr}} => {
        return #{
            $ma.map(function() {
                return $b;
            });
        };
    }
    case {_ {$a:ident <- $ma:expr var $($x:ident = $y:expr) (var) ... if $e:expr return $left:expr else return $right:expr }} => {
        return #{
            $ma.map(function($a) {
                $(var $x = $y;) ...
                if ($e) {
                    return $left
                } else {
                    return $right
                }
            });
        };
    }
    case {_ {$a:ident <- $ma:expr if $e:expr return $left:expr else return $right:expr }} => {
        return #{
            $ma.map(function($a) {
                if ($e) {
                    return $left
                } else {
                    return $right
                }
            });
        };
    }
    case {_ { $ma:expr var $($x:ident = $y:expr) (var) ... if $e:expr return $left:expr else return $right:expr }} => {
        return #{
            $ma.map(function() {
                $(var $x = $y;) ...
                if ($e) {
                    return $left
                } else {
                    return $right
                }
            });
        };
    }
    case {_ {$ma:expr if $e:expr return $left:expr else return $right:expr }} => {
        return #{
            $ma.map(function() {
                if ($e) {
                    return $left
                } else {
                    return $right
                }
            });
        };
    }
    case {_ {$a:ident <- $ma:expr var $($x:ident = $y:expr) (var) ... if $rest ... }} => {
        return #{
            $ma.chain(function($a) {
                $(var $x = $y;) ...
                $ifelsedo { if $rest ... }
            });
        };
    }
    case {_ {$a:ident <- $ma:expr if $rest ... }} => {
        return #{
            $ma.chain(function($a) {
                $ifelsedo { if $rest ... }
            });
        };
    }
    case {_ {$ma:expr var $($x:ident = $y:expr) (var) ... if $rest ... }} => {
        return #{
            $ma.chain(function() {
                $(var $x = $y;) ...
                $ifelsedo { if $rest ... }
            });
        };
    }
    case {_ {$ma:expr if $rest ... }} => {
        return #{
            $ma.chain(function() {
                $ifelsedo { if $rest ... }
            });
        };
    }
    case {_ {$a:ident <- $ma:expr $rest ... }} => {
        return #{
            $ma.chain(function($a) {
                return $do { $rest ... }
            });
        };
    }
    case {_ {$ma:expr $rest ... }} => {
        return #{
            $ma.chain(function() {
                return $do { $rest ... }
            });
        };
    }
}

/*
   $do {
     a <- foo
     if (a == 1) $do {
       b <- bar
       return b
     } else $do {
       c <- quux
       return c
     }
   }

   foo.map(function (a$2) {
     if (a$2 == 1) {
       return bar.map(function (b$6) {
         return b$6;
       });
     } else {
       return quux.map(function (c$9) {
         return c$9;
       });
     }
   });

*/
macro $ifelsedo {
    case {_ { if $e:expr $do { $left ... } else return $right:expr }} => {
        return #{
            if ($e) {
                return $do { $left ... }
            } else {
                return $right
            }
        };
    }
    case {_ { if $e:expr return $left:expr else $do { $right ... } }} => {
        return #{
            if ($e) {
                return $left
            } else {
                return $do { $right ... }
            }
        };
    }
    case {_ { if $e:expr $do { $left ... } else $do { $right ... } }} => {
        return #{
            if ($e) {
                return $do { $left ... }
            } else {
                return $do { $right ... }
            }
        };
    }
    case {_ { if $e:expr return $left:expr else $rest ... }} => {
        return #{
            if ($e) {
                return $left
            } else $ifelsedo { $rest ... }
        };
    }
    case {_ { if $e:expr $do { $left ... } else $rest ... }} => {
        return #{
            if ($e) {
                return $do { $left ... }
            } else $ifelsedo { $rest ... }
        };
    }
}
