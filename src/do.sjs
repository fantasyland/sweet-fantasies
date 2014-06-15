/*
   $do {
     x <- foo
     y <- bar
     z <- baz
     return x * y * z
   }

   Desugars into:

   (function(){
     return foo.chain(function(x) { 
       return bar.chain(function(y) { 
         return baz.map(function(z) { 
           return x * y * z 
         }) 
       })
     })
   }())

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
     readLine()
   }

*/

macro $do {
  rule {{ $a ... }} => {
    (function(){ _do { $a ... } }())
  }
}

macroclass binding {
  pattern { $id:ident <- $op:expr; } 
  pattern { $id:ident <- $op:expr }
  pattern { $op:expr; } where ($id = #{ _it })
  pattern { $op:expr }  where ($id = #{ _it })
}

macroclass ifelsedo {
  pattern { if ( $test:expr ) $consequent:expr else $alternative:expr; }
  pattern { if ( $test:expr ) $consequent:expr else $alternative:expr }
}

macroclass vardecl {
  pattern { var $id:ident = $value:expr; }
  pattern { var $id:ident = $value:expr  }
}

macro _do {
  // -- Base cases -----------------------------------------------------

  // a <- b; return a | a; return b
  rule {{ $a:binding return $b:expr }} => {
    return $a$op.map(function($a$id) {
      return $b;
    })
  }

  // a <-b; return if (a) b else c
  rule {{ $a:binding return $b:ifelsedo }} => {
    return $a$op.map(function($a$id) {
      if ($b$test) {
        return $b$consequent;
      } else {
        return $b$alternative;
      }
    })
  }

  // if (a) b else c; return x
  rule {{ $a:ifelsedo return $b:expr }} => {
    if ($a$test) {
      _do { $a$consequent return $b }
    } else {
      _do { $a$alternative return $b }
    }
  }

  // a <- b; if (a) return b else return c
  rule {{ $e:binding if ( $a:expr ) return $b:expr else return $c:expr }} => {
    return $e$op.map(function($e$id) {
      if ($a) {
        return $b;
      } else {
        return $c;
      }
    })
  }

  // a <- b; var x = y ...; if (a) return b else return c
  rule {{ $e:binding $vars:vardecl ... if ( $a:expr ) return $b:expr else return $c:expr }} => {
    return $e$op.map(function($e$id) {
      $(var $vars$id = $vars$value;) ...
      if ($a) {
        return $b;
      } else {
        return $c;
      }
    })
  }

  // a <- b; var x = y ...; return d
  rule {{ $a:binding $vars:vardecl ... return $b:expr }} => {
    return $a$op.map(function($a$id) {
      $(var $vars$id = $vars$value;) ...
      return $b;
    })
  }

  // a <-b; var x = y ...; return if ...
  rule {{ $a:binding $vars:vardecl ... return $b:ifelsedo }} => {
    return $a$op.map(function($a$id) {
      $(var $vars$id = $vars$value;) ...
      if ($b$test) {
        return $b$consequent;
      } else {
        return $b$alternative;
      }
    })
  }

  // if (a) b else c; var x = y ...; return d
  rule {{ $a:ifelsedo $vars:vardecl ... return $b:expr }} => {
    $(var $vars$id = $vars$value;) ...
    if ($a$test) {
      _do { $a$consequent return $b }
    } else {
      _do { $a$alternative return $b }
    }
  }

  // a()
  rule {{ $op:expr }} => {
    return $op;
  }

  // -- Stepping cases -------------------------------------------------

  // a; ... | a <- b; ...
  rule {{ $a:binding $rest ... }} => {
    return $a$op.chain(function($a$id) {
      _do { $rest ... }
    })
  }

  // var x = y; ...
  rule {{ var $id:ident = $value:expr $rest ... }} => {
    var $id = $value;
    _do { $rest ... }
  }

  // if (a) b else c; ...
  rule {{ $a:ifelsedo $rest ... }} => {
    if ($a$test) {
      _do { $a$consequent $rest ... }
    } else {
      _do { $a$alternative $rest ... }
    }
  }

  
  
  // -- Things we ignore -----------------------------------------------
  rule { { ; $a ... } } => { _do { $a ... } }
  rule { { } } => { }
}

export $do
