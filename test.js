var expect = require("expect.js")

function Id(a) { this.value = a }

Id.prototype.concat = function(b) {
  return new Id(this.value.concat(b.value))
}

Id.prototype.zero = function() {
  return new Id(this.value.zero ? this.value.zero() : this.value.constructor.zero())
}

Id.prototype.map = function(f) {
  return new Id(f(this.value))
}

Id.prototype.chain = function(f) {
  return f(this.value)
}

Id.of = function(a) {
  return new Id(a)
}

describe("semigroup", function() {
  it("concats values", function() {
    var x = Id.of("foo")
    var y = Id.of("bar")
    var s = $semigroup (x + y)
    expect(s.value).to.equal("foobar")
  })
})

describe("do-notation", function() {
  it("chains computations", function() {
    var sum = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      return x + y
    }
    expect(sum.value).to.equal(30)
  })

  it("supports var-bindings", function() {
    var sum = $do {
      x <- Id.of(10)
      k = 5
      y <- Id.of(20)
      return x + y + k
    }
    expect(sum.value).to.equal(35)
  })

  it("binding name is optional", function() {
    var sum = $do {
      x <- Id.of(10)
      Id.of(100)
      y <- Id.of(20)
      return x + y
    }
    expect(sum.value).to.equal(30)
  })

  it("supports if-expressions", function() {
    var sum1 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      if (x == 10) return x + y else return x - y
    }
    expect(sum1.value).to.equal(30)

    var sum2 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      if (x > 10) return x + y else return x - y
    }
    expect(sum2.value).to.equal(-10)

/*  FIXME type of 'sum3' is Id (Id Int), should be Id Int
    var sum3 = $do {
      x <- Id.of(10)
      y <- Id.of(20)
      if (x == 10) $do {
        z <- Id.of(30)
        return x + z 
      } else $do {
        z <- Id.of(40)
        return x - z
      }
    }
    expect(sum3.value).to.equal(40)
*/
  })
})
