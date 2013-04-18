macro $semigroup {
  case ($x) => {
    $x
  }
  case ($x + $rest ...) => {
    $x.concat($semigroup($rest ...))
  }
}

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

   TODO:
  
    - do not require last expression to be 'return'
    - do not require variable binding (eg. do { putStr "Hello" })
    - add support for nested do blocks

*/
macro $do {
  case { $x:ident = $y:expr $rest ... } => {
    function() {
      var $x = $y;
      return $do { $rest ... }
    }()
  }
  case { $a:ident <- $ma:expr return $b:expr } => {
    $ma.map(function($a) {
      return $b;
    });
  }
  // See `$ifelsedo`.
  case { $a:ident <- $ma:expr if $rest ... } => {
    $ma.map(function($a) {
      $ifelsedo { if $rest ... }
    });
  }
  case { $a:ident <- $ma:expr $rest ... } => {
    $ma.chain(function($a) {
      return $do { $rest ... }
    });
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
  case { if $e:expr return $left:expr else return $right:expr } => {
    if ($e) { return $left } else { return $right }
  }
  case { if $e:expr $do { $left ... } else $do { $right ... } } => {
    if ($e) { return $do { $left ... } } else { return $do { $right ... } }
  }
  case { if $e:expr return $left:expr else $rest ... } => {
    if ($e) { return $left } else $ifelsedo { $rest ... }
  }
  case { if $e:expr $do { $left ... } else $rest ... } => {
    if ($e) { return $do { $left ... } } else $ifelsedo { $rest ... }
  }
}

var ifdo_elsedo = $do {
  a <- foo
  if (a == 1) $do {
    b <- bar
    return b
  } else $do {
    c <- quux
    return c
  }
}

var ifdo_elseifdo_elsedo = $do {
  a <- foo
  if (a == 1) $do {
    b <- bar
    return b
  } else if (a == 2) $do {
    c <- baz
    return c
  } else $do {
    d <- quux
    return d
  }
}

var if_else = $do {
  a <- foo
  if (a == 1) return bar else
              return quux
}

var if_elseif_else = $do {
  a <- foo
  if (a == 1) return bar else
  if (a == 2) return baz else
              return quux
}
