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
macro $ifdo {
}

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
       return b
     }
   }

   foo.chain(function (a$2) {
     return bar.map(function (b$5) {
       if (a$2 == a$2) {
         return baz.map(function (c$9) {
           return c$9;
         });
       } else {
         return quux.map(function (d$12) {
           return d$12;
         });
       }
     });
   });

*/
macro $ifelsedo {
  case { if $e:expr $do { $left ... } else $do { $right ... } } => {
    if ($e) { return $do { $left ... } } else { return $do { $right ... } }
  }
}
