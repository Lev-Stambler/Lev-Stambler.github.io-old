## Group theory
[Lecture 1](https://youtu.be/oe5Hj5WvaGE), [Lecture 2](https://youtu.be/Pf9u9Gkuimw), [Lecture 3](https://youtu.be/lzPAn4OLtlw)

### Lecture 1
- A group is a set with a binary operation that satisfies:
  -  Having associativity
  - an identity element
  - each element has an element which inverts it and yields the identity

### Lecture 2
- An identity element is unique in a group
- Groups are not necessarily commutative. Commutative groups are called Abelian groups
- Isomorphism: two groups are isomorphic if you could rename the elements of the set and end up with the same group. |G| = |H|. |G| is called the order
- The order of an element is a, |a| is the smallest m s.t. $a^m=1$
- The order of |a| always divides evenly into |G|. So, $a^n=1$ where n is the order of G.

### Lecture 3
- Group theory can be used for checking if IDs are valid

## Fields, Polynomials, and Error Correcting Codes
[Lecture 1](https://youtu.be/ehBY3chIYB4)

### Fields
- Informally its a number system where you can add, subtract, multiply, and divide by nonzero
  - Ex: Real numbers, rationals, complex, integers mod prime
  - Not examples: integers, positive reals
- Formally, its a set of numbers specified by its addition and multiplication table
- Finite fields: $Z_p$ aka $F_p$ for p is a prime
- There is afield with q elements iff q is a power of a prime. Every field of size q is unique ($F_q$)

### Polynomials
- If there is a field F and a variable x, then all possible polynomials with numbers from that field can be written F[x]
- 0 is also a polynomial, we call it degree $-\inf$
- Polynomials are a commutative ring with identity (not a field)
- Division with remainder is possible with polynomials
- given P(x) $\in$ F[x], then P(a) is still in the field F if a is in F
- A root r is where P(r) = 0. A nonzero degree-d polynomial has at most d roots
- Theorem: there is always a polynomial with degree at most d which can fit d + 1 points
  - P(x) = b1 * S1(x) + b2 * S2(x) + ... + b_d+1 * S_d+1(x)
  - S is the selector polynomial

### Error correcting code
- Repetition code: have Alice repeat each symbol k + 1 times if there are erasures. Send 2k + 1 times if there is no erasure. Then, whichever has the majority of consensus, then thats the answer
- Say Alice's message is d + 1. Then, Alice thinks of her symbols as a degree-d polynomial. Then, you can send d + k + 1 many points on the polynomial if there is an erasure. (Reed-Solomon encoding). The polynomial can be recovered from d + 1 points with Lagrange Interpolation.
- How about corruption? Send d + 2k + 1. There are at least d + k + 1 correct values. Bob doesn't know which are correct though. But, then there is only one polynomial which disagrees with at most k positions.

## Interactive Proofs
[Lecture 1](https://youtu.be/sSf4rHdNsRM), [Lecture 2](https://youtu.be/H-PVVIQHhok), [Lecture 3](https://youtu.be/yd3fNKYSfOY)

### Lecture 1
- There is a verifier and a prover. The prover wants to convince the verifier that $x \in A$ where A is a language in NP.
- Completeness and soundness need to be satisfied (i.e. A has to be in NP)
- Interaction + Randomization could be used to verify that the prover actually knows something
- The Graph Isomorphism Problem.
  - Given two graphs, are they isomorphic? This problem is in NP, the proof would be a mapping between vertices
  - Nonisomorphism in NP? No one knows
  - But, nonisomorphism can be used w/ interactive proofs
- IP:
  - A language is in the class IP if there is a probabilistic poly-time verifier
  - There is a computationally unbounded Prover
  - Requires completeness and soundness
- Fun fact! NP is a subset of IP
- Any complement of NP is also in IP
- Theorem: IP = PSPACE (anything that is bounded by pspace to compute)

### Lecture 2
- Zero Knowledge Proofs: The verifier is convinced about why the graphs are different, but does not know anything about why the graphs are not isomorphic
- Does every problem in NP have a zero-knowledge IP?
  - Yes!
- Ex. 3 coloring. A verifies selects an edge uniformly. The verifier then sends the color but of a permutation graph. Then, if the coloring do not equal, the verifier accepts.
- Two types: statistical zk: verifier would never be able to learn anything (eg. Graph Non-isomorphism). Computational zk: verifier wouldn't learn anything assuming it is bounded by poly time
  - Two different classes: SZK vs CZK

### Lecture 3
- Spot checkable proof => a proof where you can just spot check a few places and can then be convinced that they are true
- Ex with Graph Non-isomorphism: Enumerate all n-vertex graphs. Put 0 if iso to G0 and 1 if iso to G1. Pick a random permutation, Choose a permutation of vertices at random. Then figure out the index j corresponding to the permutation. Then check if bit at index j equals that at index i
- PCPs are probabilistic checkable proofs that can be done in poly time. All problems in NP have a PCP proof. 
<!-- TODO: want to look more into -->

## Communication Complexity
[Lecture](https://www.youtube.com/watch?v=-BVsdB3Q4PY)
- One of the few approaches we have to prove lower bounds
- Let F: $\{0, 1\}^n \times \{0, 1\}^n \rArr \{0, 1\}$. The goal is to compute F(x, y)
- How much communication is needed for PARITY(x, y)? It can be done in O(1)
  - Alice sends PAR(x) to Bob (1 bit). Bob computes PAR(x, y) and sends it to Alice
- A protocol P is the strategy/protocol to communicate the across 2 machines.
  - P(x, y) = F(x, y)
- A randomized protocol computes F with $\epsilon$ error. (Like a Monte Carlo algorithm)
- D(F) = min cost for deterministic P
- $R^\epsilon$(F)$ = min cost for random alg with error $\epsilon$ 
- $0 \leq R(F) \leq D(F) \leq n + 1$
  - Ex. $D(EQ) = n + 1$, $R^{1/3}(EQ) = O(log n)$
- DISJ(x, y) = 0 if there is a i s.t. $x_i=y_i=1$, 1 otherwise. (I.e. are the sets disjoint). Basically the not of the and function
  - O(min(|x|, |y|)). Send over the smaller string
  - $R^{1/3}(DISJ) = \Omega(n)$. Its hard no matter what
- Applications. Communication complexity can be used for proving lower bounds.
- Ex: Lower bounds for data steams. 
  - f(S) = # most frequent symbol in S
  - $S_x$ = {2, 4, 5} $S_y$ = {1, 5, 7, 8}. If f($S_x * S_y$)=2, Bob outputs 0, otherwise 1.
  - Thus, the router has to store at least n bits. Otherwise, disjointedness would be solved in less than n bits of storage

## More Cryptography (Extra/Optional)
[Lecture 1](https://youtu.be/OFA96lBOt64), [Lecture 2](https://youtu.be/S03W3RBePHY)