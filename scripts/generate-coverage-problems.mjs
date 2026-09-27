import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const frameworks = [
  read("src/data/frameworks/ap-calculus.json"),
  read("src/data/frameworks/ap-precalc.json"),
  read("src/data/frameworks/ap-physics-1.json"),
  read("src/data/frameworks/ap-physics-c-mech.json"),
  read("src/data/frameworks/ap-physics-c-em.json"),
];
const courseIds = ["ap-precalc", "ap-calc-ab", "ap-calc-bc", "ap-physics-1", "ap-physics-c-mech", "ap-physics-c-em"];

const unitsForCourse = (courseId) => {
  const framework = frameworks.find((item) => item.course === courseId || item.courses?.includes(courseId));
  if (framework.course) return framework.units;
  const isBc = courseId === "ap-calc-bc";
  return framework.units
    .filter((unit) => isBc || !unit.bcOnly)
    .map((unit) => ({ ...unit, topics: unit.topics.filter((topic) => isBc || !topic.bcOnly) }));
};

const make = (question, solution, solutionJa, difficulty = 2, questionType = "calculation") => ({
  question,
  solution,
  solutionJa,
  difficulty,
  questionType,
});

function precalculus(topic) {
  const id = topic.id;
  if (id === "polynomial-complex-zeros") return make("One zero of a polynomial with real coefficients is $2+3i$. State another zero that the polynomial must have.", "Nonreal zeros of a polynomial with real coefficients occur in conjugate pairs, so $2-3i$ must also be a zero.", "実係数多項式の非実数根は共役な組で現れるため、$2-3i$ も零点です。", 2, "conceptual");
  if (id === "change-in-tandem") return make("As $x$ increases from 2 to 5, $y$ increases from 7 to 19. By how much does $y$ change for each unit increase in $x$?", "The changes are $\\Delta x=3$ and $\\Delta y=12$, so $\\Delta y/\\Delta x=4$.", "$\\Delta x=3$、$\\Delta y=12$ なので、$x$ が1増えるごとに $y$ は4増えます。", 1);
  if (id.includes("rates")) return make("For $f(x)=x^2-3x$, find the average rate of change on $[1,4]$.", "$[f(4)-f(1)]/(4-1)=(4-(-2))/3=2$.", "$[f(4)-f(1)]/(4-1)=2$ です。", 2);
  if (id === "polynomial-end-behavior") return make("Describe the end behavior of $p(x)=-3x^5+2x^2-1$.", "The leading term is $-3x^5$. Thus $p(x)\\to-\\infty$ as $x\\to\\infty$ and $p(x)\\to\\infty$ as $x\\to-\\infty$.", "最高次項は $-3x^5$ です。$x\\to\\infty$ で $p(x)\\to-\\infty$、$x\\to-\\infty$ で $p(x)\\to\\infty$ です。", 2, "conceptual");
  if (id === "rational-end-behavior") return make("Find the horizontal asymptote of $r(x)=(5x^2-1)/(2x^2+3x)$.", "The numerator and denominator have equal degree, so the asymptote is the ratio of leading coefficients: $y=5/2$.", "分子と分母の次数が等しいため、水平漸近線は最高次係数の比 $y=5/2$ です。", 2);
  if (id === "rational-zeros") return make("Find all zeros of $r(x)=(x^2-9)/(x+1)$.", "Zeros come from the numerator and must remain in the domain. Thus $x=-3$ and $x=3$.", "分子を0にし、定義域に含まれる値を選ぶので、零点は $x=-3,3$ です。", 2);
  if (id === "rational-vertical-asymptotes") return make("Find the vertical asymptote of $r(x)=(x+2)/(x^2-x-6)$.", "Factor the denominator: $(x-3)(x+2)$. The factor $x+2$ cancels, so the vertical asymptote is $x=3$.", "分母は $(x-3)(x+2)$ です。$x+2$ は約分されるため、垂直漸近線は $x=3$ です。", 3);
  if (id === "rational-holes") return make("Locate the hole in $r(x)=(x^2-4)/(x-2)$.", "For $x\\ne2$, $r(x)=x+2$. The missing point is therefore $(2,4)$.", "$x\\ne2$ では $r(x)=x+2$ なので、穴は $(2,4)$ です。", 2);
  if (id === "equivalent-polynomial-rational") return make("Rewrite $(x^2-5x+6)/(x-2)$ in an equivalent simplified form and state the restriction.", "Factor and cancel: $(x-2)(x-3)/(x-2)=x-3$, with $x\\ne2$.", "因数分解して約分すると $x-3$ ですが、制限 $x\\ne2$ は残ります。", 2);
  if (id === "function-transformations") return make("Starting from $f(x)=x^2$, describe the transformations that produce $g(x)=-2(x-3)^2+1$.", "Shift right 3, stretch vertically by 2, reflect across the $x$-axis, and shift up 1.", "右へ3、縦に2倍、$x$ 軸について反転、上へ1移動します。", 2, "conceptual");
  if (id.includes("model-selection") || id.includes("competing-model")) return make("A data set has nearly constant ratios of consecutive positive outputs. Which model family is the best first choice?", "An exponential model is the best first choice because constant output ratios indicate multiplicative change.", "連続する値の比がほぼ一定なので、乗法的変化を表す指数モデルが第一候補です。", 1, "conceptual");
  if (id.includes("model-construction")) return make("A quantity starts at 120 and decreases by 8 each hour. Write a model for the quantity after $t$ hours.", "$Q(t)=120-8t$.", "$Q(t)=120-8t$ です。", 1);
  if (id === "arithmetic-geometric-change") return make("The sequence $6,18,54,\\ldots$ is arithmetic or geometric? State its common change.", "It is geometric with common ratio $3$.", "等比数列で、公比は3です。", 1, "conceptual");
  if (id === "linear-exponential-change") return make("Which eventually grows faster: $L(n)=50+12n$ or $E(n)=50(1.08)^n$?", "$E(n)$ eventually grows faster because exponential growth outpaces linear growth.", "指数関数的に増加する $E(n)$ は、最終的に一次関数 $L(n)$ より速く増えます。", 1, "conceptual");
  if (id.includes("exponential-context")) return make("A population is 300 and grows by 6% per year. Write an exponential model.", "$P(t)=300(1.06)^t$.", "$P(t)=300(1.06)^t$ です。", 1);
  if (id === "exponential-functions") return make("Evaluate $f(3)$ for $f(x)=5(2)^x$.", "$f(3)=5(8)=40$.", "$f(3)=5\\cdot8=40$ です。", 1);
  if (id === "exponential-manipulation") return make("Rewrite $9^{x+1}$ using base 3.", "$9^{x+1}=(3^2)^{x+1}=3^{2x+2}$.", "$9=3^2$ より、$9^{x+1}=3^{2x+2}$ です。", 1);
  if (id === "composition") return make("If $f(x)=2x+1$ and $g(x)=x^2$, find $(f\\circ g)(3)$.", "$g(3)=9$, so $f(g(3))=f(9)=19$.", "$g(3)=9$、したがって $f(g(3))=19$ です。", 1);
  if (id === "inverse-functions") return make("Find the inverse of $f(x)=3x-7$.", "From $y=3x-7$, solve for $x$: $x=(y+7)/3$. Thus $f^{-1}(x)=(x+7)/3$.", "$y=3x-7$ を $x$ について解くと、$f^{-1}(x)=(x+7)/3$ です。", 2);
  if (id === "logarithmic-expressions") return make("Expand $\\log_2(8x^3)$ for $x>0$.", "$\\log_2(8x^3)=3+3\\log_2x$.", "$\\log_2(8x^3)=3+3\\log_2x$ です。", 2);
  if (id === "inverse-exponential") return make("Solve $4^x=11$ using logarithms.", "$x=\\log_4 11=\\ln 11/\\ln4$.", "$x=\\log_4 11=\\ln11/\\ln4$ です。", 2);
  if (id === "logarithmic-functions") return make("State the domain of $f(x)=\\ln(x-5)$.", "The argument must be positive: $x-5>0$, so the domain is $(5,\\infty)$.", "$x-5>0$ が必要なので、定義域は $(5,\\infty)$ です。", 1);
  if (id === "logarithmic-manipulation") return make("Condense $2\\ln x-\\ln(x+1)$ into one logarithm.", "$\\ln(x^2/(x+1))$.", "$\\ln(x^2/(x+1))$ です。", 2);
  if (id === "exponential-log-equations") return make("Solve $e^{2x}=7$.", "$2x=\\ln7$, so $x=\\ln7/2$.", "$2x=\\ln7$ より、$x=\\ln7/2$ です。", 2);
  if (id.includes("logarithmic-context")) return make("A sound level is modeled by $L=10\\log_{10}(I/I_0)$. What happens to $L$ when $I$ is multiplied by 10?", "$L$ increases by $10$ because $10\\log_{10}(10)=10$.", "$I$ が10倍になると、$L$ は10増加します。", 2, "conceptual");
  if (id === "semi-log-plots") return make("On a semi-log plot, data form a straight line. What model type does this support?", "It supports an exponential model.", "指数モデルが適していることを示します。", 1, "conceptual");
  if (id === "periodic-phenomena") return make("A signal repeats every 0.4 second. Find its period and frequency.", "The period is $0.4$ s and the frequency is $1/0.4=2.5$ Hz.", "周期は $0.4$ 秒、周波数は $2.5$ Hzです。", 1);
  if (id === "sine-cosine-tangent" || id === "sine-cosine-values") return make("On the unit circle, find $\\sin(5\\pi/6)$ and $\\cos(5\\pi/6)$.", "$\\sin(5\\pi/6)=1/2$ and $\\cos(5\\pi/6)=-\\sqrt3/2$.", "$\\sin(5\\pi/6)=1/2$、$\\cos(5\\pi/6)=-\\sqrt3/2$ です。", 2);
  if (id.includes("sine-cosine-graphs") || id === "sinusoidal-functions") return make("For $y=3\\sin(2x)$, state the amplitude and period.", "The amplitude is $3$ and the period is $2\\pi/2=\\pi$.", "振幅は3、周期は $\\pi$ です。", 2);
  if (id === "sinusoidal-transformations") return make("For $y=2\\cos(3(x-\\pi/4))+1$, state the phase shift and vertical shift.", "The phase shift is right $\\pi/4$ and the vertical shift is up 1.", "位相のずれは右へ $\\pi/4$、上下移動は上へ1です。", 2);
  if (id.includes("sinusoidal-context")) return make("A wheel has radius 4 and its center is 6 units above the ground. Give the amplitude and midline of a sinusoidal height model.", "The amplitude is $4$ and the midline is $y=6$.", "振幅は4、中心線は $y=6$ です。", 2);
  if (id === "tangent-function") return make("Find the period of $y=\\tan(4x)$.", "The tangent period is $\\pi/4$.", "正接関数の周期は $\\pi/4$ です。", 1);
  if (id === "inverse-trigonometric") return make("Evaluate $\\arcsin(1/2)$ using the principal range.", "$\\arcsin(1/2)=\\pi/6$.", "$\\arcsin(1/2)=\\pi/6$ です。", 1);
  if (id === "trigonometric-equations") return make("Solve $2\\sin x=1$ on $0\\le x<2\\pi$.", "$x=\\pi/6$ or $x=5\\pi/6$.", "$x=\\pi/6,5\\pi/6$ です。", 2);
  if (id === "reciprocal-trigonometric") return make("If $\\sin\\theta=3/5$, find $\\csc\\theta$.", "$\\csc\\theta=1/\\sin\\theta=5/3$.", "$\\csc\\theta=5/3$ です。", 1);
  if (id === "equivalent-trigonometric") return make("Simplify $(1-\\cos^2x)/\\sin x$ where $\\sin x\\ne0$.", "Using $1-\\cos^2x=\\sin^2x$, the expression is $\\sin x$.", "$1-\\cos^2x=\\sin^2x$ より、$\\sin x$ です。", 2);
  if (id.includes("polar")) return make("Convert the polar point $(r,\\theta)=(4,\\pi/3)$ to rectangular coordinates.", "$(x,y)=(4\\cos(\\pi/3),4\\sin(\\pi/3))=(2,2\\sqrt3)$.", "$(x,y)=(2,2\\sqrt3)$ です。", 2);
  if (id.includes("parametric") && id !== "parametrization-implicit") return make("For $x=t+1$ and $y=t^2$, find the point when $t=2$.", "The point is $(3,4)$.", "点は $(3,4)$ です。", 1);
  if (id === "implicit-functions") return make("For $x^2+y^2=25$, give the upper branch as an explicit function of $x$.", "$y=\\sqrt{25-x^2}$ for $-5\\le x\\le5$.", "上側の枝は $y=\\sqrt{25-x^2}$ です。", 2);
  if (id === "conic-sections") return make("Identify the conic $x^2/9+y^2/4=1$.", "It is an ellipse centered at the origin with semiaxes 3 and 2.", "原点を中心とし、半軸が3と2の楕円です。", 1, "conceptual");
  if (id === "parametrization-implicit") return make("Give a parametrization of the circle $x^2+y^2=16$.", "$x=4\\cos t$, $y=4\\sin t$.", "$x=4\\cos t$、$y=4\\sin t$ です。", 2);
  if (id === "vectors" || id === "vector-valued-functions") return make("Find the magnitude of the vector $\\langle3,-4\\rangle$.", "$\\sqrt{3^2+(-4)^2}=5$.", "大きさは $5$ です。", 1);
  if (id === "matrices") return make("Compute $\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\begin{bmatrix}2\\\\1\\end{bmatrix}$.", "The product is $\\begin{bmatrix}4\\\\10\\end{bmatrix}$.", "積は $\\begin{bmatrix}4\\\\10\\end{bmatrix}$ です。", 2);
  if (id === "matrix-inverse-determinant") return make("Find the determinant of $\\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}$.", "$2(3)-1(5)=1$.", "行列式は $2\\cdot3-1\\cdot5=1$ です。", 1);
  if (id === "linear-transformations-matrices") return make("The matrix $\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ acts on the plane. What does it do to $(1,0)$?", "It sends $(1,0)$ to $(0,1)$, a $90^\\circ$ counterclockwise rotation.", "$(1,0)$ を $(0,1)$ に移し、反時計回りに90度回転します。", 2);
  if (id.includes("matrices")) return make("A two-state system changes by $\\mathbf{x}_{n+1}=A\\mathbf{x}_n$. What operation advances the system one step?", "Multiply the current state vector by $A$.", "現在の状態ベクトルに行列 $A$ を掛けます。", 1, "conceptual");
  return make(`Give one precise mathematical statement that is central to ${topic.name.en}.`, `A complete response must state the defining relationship for ${topic.name.en} and include its domain or required condition.`, `${topic.name.ja} の定義となる関係と、必要な定義域または条件を述べます。`, 2, "conceptual");
}

function calculus(topic) {
  const id = topic.id;
  if (id === "squeeze-theorem") return make("Given $-|x|\\le f(x)\\le |x|$, find $\\lim_{x\\to0}f(x)$.", "Both bounding functions approach 0, so the squeeze theorem gives the limit $0$.", "両側の関数が0へ近づくので、はさみうちの原理より極限は0です。", 2);
  if (id === "applied-rates") return make("The area of a circular oil spill is $A(t)=25\\pi t^2$ square meters, where $t$ is in hours. Find the rate at which the area is changing at $t=3$.", "$A'(t)=50\\pi t$, so $A'(3)=150\\pi$ m$^2$/h.", "$A'(t)=50\\pi t$ なので、$t=3$ では $150\\pi$ m$^2$/h です。", 2);
  if (id === "accumulations-change") return make("Water enters a tank at rate $r(t)=4+t^2$ liters per minute. Write an expression for the amount added from $t=1$ to $t=3$, and evaluate it.", "The accumulation is $\\int_1^3(4+t^2)\\,dt=[4t+t^3/3]_1^3=50/3$ liters.", "増加量は $\\int_1^3(4+t^2)\\,dt=50/3$ L です。", 2);
  if (id === "integrals-applied-contexts") return make("A machine consumes power at rate $P(t)=100+20t$ watts for $0\\le t\\le5$ seconds. How much energy does it use during this interval?", "$E=\\int_0^5(100+20t)\\,dt=750$ joules.", "使用エネルギーは $\\int_0^5(100+20t)\\,dt=750$ J です。", 2);
  if (id === "area-multiple-intersections") return make("The curves $y=x^3-x$ and $y=0$ intersect at $x=-1,0,1$. Find the total area between the curve and the $x$-axis on $[-1,1]$.", "The sign changes at 0. By symmetry, the area is $2\\int_0^1(x-x^3)\\,dx=1/2$.", "0で符号が変わります。対称性より、面積は $2\\int_0^1(x-x^3)\\,dx=1/2$ です。", 3);
  if (id.includes("limit") || id === "introducing-calculus" || id === "representations-limits") {
    if (id.includes("infinite") || id.includes("asymptotes")) return make("Find $\\lim_{x\\to\\infty}(3x^2+1)/(x^2-4)$.", "Divide by $x^2$; the limit is the ratio of leading coefficients, $3$.", "$x^2$ で割ると、極限は最高次係数の比 $3$ です。", 2);
    if (id === "algebraic-manipulation-limits" || id === "selecting-limit-procedures") return make("Evaluate $\\lim_{x\\to2}(x^2-4)/(x-2)$.", "Factor and cancel: $(x^2-4)/(x-2)=x+2$ for $x\\ne2$, so the limit is $4$.", "因数分解して約分すると $x+2$ となるので、極限は4です。", 2);
    return make("If values of $f(x)$ approach 7 from both sides as $x$ approaches 3, state $\\lim_{x\\to3}f(x)$.", "The two-sided limit is $7$.", "左右から同じ7へ近づくので、極限は7です。", 1);
  }
  if (id.includes("continu") || id.includes("discontinu") || id === "removing-discontinuities") return make("Choose $k$ so that $f(x)=(x^2-9)/(x-3)$ for $x\\ne3$ and $f(3)=k$ is continuous at $x=3$.", "The limit is $\\lim_{x\\to3}(x+3)=6$, so $k=6$.", "極限が6なので、連続にするには $k=6$ とします。", 2);
  if (id === "intermediate-value-theorem") return make("A continuous function satisfies $f(1)=-2$ and $f(4)=5$. What does the IVT guarantee?", "There is at least one $c$ in $(1,4)$ with $f(c)=0$.", "$(1,4)$ に $f(c)=0$ を満たす点が少なくとも1つあります。", 2, "conceptual");
  if (id === "power-rule") return make("Differentiate $f(x)=4x^7-3x^2$.", "$f'(x)=28x^6-6x$.", "$f'(x)=28x^6-6x$ です。", 1);
  if (id === "basic-derivative-rules") return make("Differentiate $f(x)=5x^3-2x+9$.", "$f'(x)=15x^2-2$.", "$f'(x)=15x^2-2$ です。", 1);
  if (id === "elementary-derivatives") return make("Differentiate $f(x)=e^x+\\sin x-\\ln x$.", "$f'(x)=e^x+\\cos x-1/x$.", "$f'(x)=e^x+\\cos x-1/x$ です。", 2);
  if (id === "product-rule") return make("Differentiate $f(x)=x^2e^x$.", "$f'(x)=2xe^x+x^2e^x=e^x(x^2+2x)$.", "$f'(x)=e^x(x^2+2x)$ です。", 2);
  if (id === "quotient-rule") return make("Differentiate $f(x)=(x^2+1)/x$.", "$f'(x)=[2x(x)-(x^2+1)]/x^2=(x^2-1)/x^2$.", "商の微分法より $f'(x)=(x^2-1)/x^2$ です。", 2);
  if (id === "other-trig-derivatives") return make("Differentiate $f(x)=\\tan x+\\sec x$.", "$f'(x)=\\sec^2x+\\sec x\\tan x$.", "$f'(x)=\\sec^2x+\\sec x\\tan x$ です。", 2);
  if (id === "chain-rule") return make("Differentiate $f(x)=(3x^2+1)^5$.", "$f'(x)=5(3x^2+1)^4(6x)=30x(3x^2+1)^4$.", "連鎖律より $f'(x)=30x(3x^2+1)^4$ です。", 2);
  if (id === "implicit-differentiation") return make("For $x^2+xy+y^2=7$, find $dy/dx$.", "$2x+y+xy'+2yy'=0$, so $y'=-(2x+y)/(x+2y)$.", "陰関数微分より $dy/dx=-(2x+y)/(x+2y)$ です。", 3);
  if (id.includes("inverse-function")) return make("If $f(2)=5$ and $f'(2)=4$, find $(f^{-1})'(5)$.", "$(f^{-1})'(5)=1/f'(2)=1/4$.", "逆関数の微分公式より $1/4$ です。", 2);
  if (id.includes("inverse-trig")) return make("Differentiate $f(x)=\\arctan(2x)$.", "$f'(x)=2/(1+4x^2)$.", "$f'(x)=2/(1+4x^2)$ です。", 2);
  if (id.includes("higher-order")) return make("For $f(x)=x^4-2x^3$, find $f''(x)$.", "$f'(x)=4x^3-6x^2$ and $f''(x)=12x^2-12x$.", "$f''(x)=12x^2-12x$ です。", 2);
  if (id.includes("derivative") || id === "average-instantaneous-rate" || id === "estimating-derivatives") return make("Use the limit definition to find the derivative of $f(x)=x^2$ at $x=3$.", "$f'(3)=\\lim_{h\\to0}[(3+h)^2-9]/h=\\lim_{h\\to0}(6+h)=6$.", "導関数の定義を使うと $f'(3)=6$ です。", 2);
  if (id.includes("motion")) return make("A particle has position $s(t)=t^3-6t^2+9t$. Find its velocity at $t=2$.", "$v(t)=s'(t)=3t^2-12t+9$, so $v(2)=-3$.", "$v(t)=3t^2-12t+9$ より、$v(2)=-3$ です。", 2);
  if (id.includes("related-rates")) return make("A circle's radius increases at $2$ cm/s. Find $dA/dt$ when $r=3$ cm.", "$A=\\pi r^2$, so $dA/dt=2\\pi r\\,dr/dt=12\\pi$ cm$^2$/s.", "$dA/dt=2\\pi r\\,dr/dt=12\\pi$ cm$^2$/sです。", 3);
  if (id === "local-linearity") return make("Use linearization of $f(x)=\\sqrt{x}$ at $x=9$ to approximate $\\sqrt{9.3}$.", "$L(x)=3+(x-9)/6$, so $L(9.3)=3.05$.", "$L(x)=3+(x-9)/6$ より、$\\sqrt{9.3}\\approx3.05$ です。", 3);
  if (id === "lhopitals-rule") return make("Evaluate $\\lim_{x\\to0}(e^x-1)/x$ using L'Hospital's rule.", "Differentiate numerator and denominator to get $\\lim_{x\\to0}e^x=1$.", "分子・分母を微分すると $\\lim_{x\\to0}e^x=1$ です。", 2);
  if (id.includes("mean-value")) return make("For $f(x)=x^2$ on $[1,3]$, find the value guaranteed by the Mean Value Theorem.", "The average slope is 4. Solve $f'(c)=2c=4$ to get $c=2$.", "平均変化率は4なので、$2c=4$ より $c=2$ です。", 3);
  if (id.includes("extreme-value") || id.includes("candidates-test")) return make("Find the absolute maximum of $f(x)=x^2-4x$ on $[0,5]$.", "Check $x=0,2,5$: the values are $0,-4,5$. The absolute maximum is $5$ at $x=5$.", "端点と臨界点を比較すると、絶対最大値は $x=5$ での5です。", 3);
  if (id.includes("increasing-decreasing") || id.includes("first-derivative")) return make("For $f'(x)=(x-1)(x+2)$, where is $f$ increasing?", "$f'>0$ on $(-\\infty,-2)\\cup(1,\\infty)$.", "$f'(x)>0$ となる $(-\\infty,-2)\\cup(1,\\infty)$ で増加します。", 3);
  if (id.includes("concavity") || id.includes("second-derivative")) return make("If $f''(x)=6x-12$, where is $f$ concave up?", "$f''(x)>0$ when $x>2$, so $f$ is concave up on $(2,\\infty)$.", "$f''(x)>0$ となる $(2,\\infty)$ で下に凸です。", 2);
  if (id.includes("sketching") || id.includes("function-first")) return make("At a point, $f'(x)>0$ and $f''(x)<0$. Describe the graph there.", "The graph is increasing and concave down.", "その点では増加し、上に凸です。", 1, "conceptual");
  if (id.includes("optimization")) return make("A rectangle has perimeter 20. What dimensions maximize its area?", "Let sides be $x$ and $10-x$. The area $x(10-x)$ is maximized at $x=5$, so the rectangle is $5$ by $5$.", "面積 $x(10-x)$ は $x=5$ で最大なので、$5\\times5$ の正方形です。", 3);
  if (id === "implicit-relations") return make("For $x^2+y^2=25$, at which points are the tangents horizontal?", "$y'=-x/y$. Horizontal tangents require $x=0$, giving $(0,5)$ and $(0,-5)$.", "$dy/dx=-x/y=0$ より $x=0$ なので、$(0,\\pm5)$ です。", 3);
  if (id.includes("riemann")) return make("Use a right Riemann sum with two equal subintervals to approximate $\\int_0^2 x^2\\,dx$.", "$\\Delta x=1$ and right endpoints are 1 and 2, so the sum is $1(1^2+2^2)=5$.", "$\\Delta x=1$、右端点が1と2なので、近似値は5です。", 2);
  if (id.includes("ftc-accumulation") || id === "accumulation-behavior") return make("If $G(x)=\\int_1^x(t^2+1)\\,dt$, find $G'(x)$.", "By the Fundamental Theorem of Calculus, $G'(x)=x^2+1$.", "微積分学の基本定理より $G'(x)=x^2+1$ です。", 2);
  if (id === "definite-integral-properties") return make("Given $\\int_0^3 f(x)dx=5$, find $\\int_3^0 2f(x)dx$.", "Reversing bounds changes the sign and the factor 2 scales the integral, so the value is $-10$.", "積分区間を逆にして符号を変え、2倍するので $-10$ です。", 2);
  if (id.includes("ftc-definite")) return make("Evaluate $\\int_0^2(3x^2+1)\\,dx$.", "$[x^3+x]_0^2=10$.", "$[x^3+x]_0^2=10$ です。", 2);
  if (id === "antiderivatives") return make("Find $\\int(4x^3-2x)\\,dx$.", "$x^4-x^2+C$.", "$x^4-x^2+C$ です。", 1);
  if (id === "substitution") return make("Evaluate $\\int 2x\\cos(x^2)\\,dx$.", "Let $u=x^2$. The integral is $\\sin(x^2)+C$.", "$u=x^2$ と置換すると $\\sin(x^2)+C$ です。", 2);
  if (id === "long-division-completing-square") return make("Rewrite $(x^2+1)/(x+1)$ using polynomial division before integrating.", "$(x^2+1)/(x+1)=x-1+2/(x+1)$.", "多項式除法により $x-1+2/(x+1)$ です。", 2);
  if (id === "integration-by-parts") return make("Evaluate $\\int xe^x\\,dx$.", "Using integration by parts, the result is $xe^x-e^x+C$.", "部分積分より $xe^x-e^x+C$ です。", 3);
  if (id === "partial-fractions") return make("Decompose $5/[(x-1)(x+2)]$ into partial fractions.", "$5/[ (x-1)(x+2) ]=5/[3(x-1)]-5/[3(x+2)]$.", "部分分数分解すると $5/[3(x-1)]-5/[3(x+2)]$ です。", 3);
  if (id === "improper-integrals") return make("Determine whether $\\int_1^\\infty x^{-2}\\,dx$ converges and find its value.", "It converges to $[-1/x]_1^\\infty=1$.", "極限を取ると1に収束します。", 3);
  if (id.includes("selecting-antidifferentiation")) return make("Which technique is most direct for $\\int x\\ln x\\,dx$?", "Integration by parts is most direct.", "部分積分が最も直接的です。", 1, "conceptual");
  if (id.includes("differential-equations") || id.includes("modeling-differential")) return make("A population grows at a rate proportional to its size. Write a differential equation.", "$dP/dt=kP$ for a positive constant $k$.", "正の定数 $k$ を用いて $dP/dt=kP$ です。", 1);
  if (id === "verifying-solutions") return make("Verify whether $y=3e^{2x}$ satisfies $y'=2y$.", "$y'=6e^{2x}=2(3e^{2x})=2y$, so it does.", "$y'=6e^{2x}=2y$ なので、解です。", 2);
  if (id.includes("slope-fields")) return make("For $dy/dx=x-y$, what slope appears at the point $(1,3)$?", "The slope is $1-3=-2$.", "傾きは $1-3=-2$ です。", 1);
  if (id === "eulers-method") return make("Use one Euler step of size $0.1$ for $y'=x+y$, starting at $(0,1)$.", "$y_1=1+0.1(0+1)=1.1$, so the next point is $(0.1,1.1)$.", "$y_1=1+0.1(1)=1.1$ なので、次の点は $(0.1,1.1)$ です。", 2);
  if (id.includes("separation")) return make("Solve $dy/dx=2xy$ by separation.", "$dy/y=2x\\,dx$, so $\\ln|y|=x^2+C$ and $y=Ce^{x^2}$.", "変数分離すると $y=Ce^{x^2}$ です。", 3);
  if (id === "exponential-models") return make("Solve $dP/dt=0.04P$ with $P(0)=500$.", "$P(t)=500e^{0.04t}$.", "$P(t)=500e^{0.04t}$ です。", 2);
  if (id === "logistic-models") return make("For $dP/dt=0.2P(1-P/1000)$, identify the carrying capacity.", "The carrying capacity is $1000$.", "環境収容力は1000です。", 1);
  if (id === "average-value") return make("Find the average value of $f(x)=x^2$ on $[0,3]$.", "$(1/3)\\int_0^3x^2dx=(1/3)(9)=3$.", "平均値は $(1/3)\\int_0^3x^2dx=3$ です。", 2);
  if (id.includes("area-between")) return make("Find the area between $y=2x$ and $y=x^2$ from $x=0$ to $x=2$.", "$\\int_0^2(2x-x^2)dx=4/3$.", "面積は $\\int_0^2(2x-x^2)dx=4/3$ です。", 3);
  if (id.includes("cross-sections")) return make("A solid has square cross sections perpendicular to the $x$-axis with side length $x$ for $0\\le x\\le2$. Write its volume integral.", "$V=\\int_0^2x^2dx$.", "体積は $V=\\int_0^2x^2dx$ です。", 2);
  if (id.includes("disc")) return make("Write the volume when $y=\\sqrt{x}$, $0\\le x\\le4$, is revolved about the $x$-axis.", "$V=\\pi\\int_0^4(\\sqrt{x})^2dx=\\pi\\int_0^4x\\,dx$.", "$V=\\pi\\int_0^4x\\,dx$ です。", 2);
  if (id.includes("washer")) return make("Write the washer-method volume when the region between $y=3$ and $y=x$ on $0\\le x\\le3$ is revolved about the $x$-axis.", "$V=\\pi\\int_0^3(3^2-x^2)dx$.", "$V=\\pi\\int_0^3(9-x^2)dx$ です。", 3);
  if (id.includes("arc-length")) return make("Write the arc-length integral for $y=x^2$ on $[0,1]$.", "$L=\\int_0^1\\sqrt{1+4x^2}\\,dx$.", "$L=\\int_0^1\\sqrt{1+4x^2}\\,dx$ です。", 3);
  if (id.includes("parametric")) return make("For $x=t^2+1$ and $y=t^3$, find $dy/dx$ at $t=1$.", "$dy/dx=(dy/dt)/(dx/dt)=3t^2/(2t)=3/2$ at $t=1$.", "$dy/dx=(dy/dt)/(dx/dt)$ より $3/2$ です。", 2);
  if (id.includes("vector-valued")) return make("For $\\mathbf r(t)=\\langle t^2,3t\\rangle$, find the velocity vector at $t=2$.", "$\\mathbf r'(t)=\\langle2t,3\\rangle$, so the velocity is $\\langle4,3\\rangle$.", "速度ベクトルは $\\langle4,3\\rangle$ です。", 2);
  if (id.includes("polar-derivatives")) return make("For $r=2\\theta$, find $dr/d\\theta$.", "$dr/d\\theta=2$.", "$dr/d\\theta=2$ です。", 1);
  if (id.includes("polar-area")) return make("Write the area integral inside $r=2$ for $0\\le\\theta\\le\\pi/2$.", "$A=(1/2)\\int_0^{\\pi/2}4\\,d\\theta$.", "$A=(1/2)\\int_0^{\\pi/2}4\\,d\\theta$ です。", 2);
  if (id === "geometric-series") return make("Find the sum of $3+3/2+3/4+\\cdots$.", "$a=3$ and $r=1/2$, so the sum is $3/(1-1/2)=6$.", "初項3、公比 $1/2$ なので、和は6です。", 1);
  if (id === "nth-term-test") return make("What does the nth-term test say about $\\sum(2n+1)/(n+3)$?", "The terms approach 2, not 0, so the series diverges.", "一般項が0ではなく2へ近づくため、発散します。", 2);
  if (id === "integral-test") return make("Use the integral test to classify $\\sum_{n=1}^\\infty1/n^2$.", "$\\int_1^\\infty x^{-2}dx$ converges, so the series converges.", "対応する広義積分が収束するため、級数も収束します。", 2);
  if (id === "harmonic-p-series") return make("Classify $\\sum1/n^{3/2}$.", "It is a convergent p-series because $p=3/2>1$.", "$p=3/2>1$ のp級数なので収束します。", 1);
  if (id === "comparison-tests") return make("Use comparison to classify $\\sum1/(n^2+4)$.", "Since $0<1/(n^2+4)<1/n^2$ and $\\sum1/n^2$ converges, the series converges.", "$1/n^2$ と比較すると、比較判定法により収束します。", 2);
  if (id === "alternating-series-test") return make("Classify $\\sum_{n=1}^\\infty(-1)^{n+1}/n$.", "The terms decrease to 0, so it converges by the alternating series test.", "項の大きさが0へ単調減少するので、交代級数判定法により収束します。", 2);
  if (id === "ratio-test") return make("Use the ratio test on $\\sum n!/5^n$.", "The ratio is $(n+1)/5\\to\\infty>1$, so the series diverges.", "比が $(n+1)/5\\to\\infty>1$ なので発散します。", 2);
  if (id === "absolute-conditional-convergence") return make("Is $\\sum(-1)^{n+1}/n$ absolutely or conditionally convergent?", "It converges alternately, but $\\sum1/n$ diverges, so it is conditionally convergent.", "交代級数としては収束しますが絶対値級数は発散するため、条件収束です。", 2);
  if (id === "alternating-error-bound") return make("For $\\sum(-1)^{n+1}/n^2$, bound the error after 5 terms.", "The error is at most the next term, $1/6^2=1/36$.", "誤差は次の項以下なので、$1/36$ 以下です。", 2);
  if (id.includes("taylor-polynomials")) return make("Find the degree-2 Maclaurin polynomial for $e^x$.", "$P_2(x)=1+x+x^2/2$.", "$P_2(x)=1+x+x^2/2$ です。", 2);
  if (id === "lagrange-error-bound") return make("State the Lagrange error bound for a degree-$n$ Taylor polynomial at $x$.", "$|R_n(x)|\\le M|x-a|^{n+1}/(n+1)!$, where $M$ bounds $|f^{(n+1)}|$.", "$|R_n(x)|\\le M|x-a|^{n+1}/(n+1)!$ です。", 3, "conceptual");
  if (id === "power-series-convergence") return make("Find the radius of convergence of $\\sum((x-2)/3)^n$.", "It is geometric and converges for $|x-2|<3$, so the radius is 3.", "$|x-2|<3$ で収束するため、収束半径は3です。", 2);
  if (id.includes("taylor-maclaurin-series") || id === "functions-power-series") return make("Write the Maclaurin series for $1/(1-x)$.", "$1/(1-x)=\\sum_{n=0}^\\infty x^n$ for $|x|<1$.", "$1/(1-x)=\\sum_{n=0}^\\infty x^n$、$|x|<1$ です。", 2);
  if (id === "convergent-divergent-series") return make("Does $\\sum_{n=1}^\\infty 1/2^n$ converge?", "Yes. It is geometric with ratio $1/2$, so its sum is 1.", "公比 $1/2$ の等比級数なので収束し、和は1です。", 1);
  return make(`Solve one focused example that demonstrates ${topic.name.en}.`, `Use the defining theorem or procedure for ${topic.name.en}, show one calculation, and state the required condition.`, `${topic.name.ja} の定義または手順を使い、1つの計算と必要条件を示します。`, 2, "free-response");
}

function mechanics(topic, calculusBased) {
  const id = topic.id;
  const items = {
    "scalars-vectors": make("A car travels 3 km east and then 4 km north. Find the magnitude of its displacement.", "The displacement magnitude is $\\sqrt{3^2+4^2}=5$ km.", "変位の大きさは5 kmです。", 1),
    "scalars-vectors-one-dimension": make("A runner moves 8 m east and then 3 m west. Find displacement and total distance.", "Displacement is 5 m east; distance is 11 m.", "変位は東へ5 m、移動距離は11 mです。", 1),
    "displacement-velocity-acceleration": make("An object's velocity changes from 2 m/s to 14 m/s in 4 s. Find its average acceleration.", "$a=(14-2)/4=3$ m/s$^2$.", "平均加速度は3 m/s$^2$です。", 1),
    "representing-motion": make("A position-time graph is a straight line with positive slope. Describe the motion.", "The object moves with constant positive velocity and zero acceleration.", "物体は正の一定速度で動き、加速度は0です。", 1, "conceptual"),
    "reference-frames-relative-motion": make("A passenger walks forward at 2 m/s inside a train moving forward at 15 m/s. Find the passenger's ground speed.", "The velocities add to 17 m/s.", "地面に対する速さは17 m/sです。", 1),
    "vectors-motion-two-dimensions": make("A projectile is launched horizontally. Neglecting air resistance, which component of velocity remains constant?", "The horizontal component remains constant.", "水平方向の速度成分が一定です。", 1, "conceptual"),
    "motion-two-three-dimensions": make("A particle has $\\mathbf r(t)=\\langle t^2,2t\\rangle$. Find $\\mathbf v(1)$.", "$\\mathbf v(t)=\\langle2t,2\\rangle$, so $\\mathbf v(1)=\\langle2,2\\rangle$.", "$\\mathbf v(1)=\\langle2,2\\rangle$ です。", 2),
    "systems-center-of-mass": make("Masses 2 kg and 6 kg lie at $x=0$ and $x=4$ m. Find the center of mass.", "$x_{cm}=(2(0)+6(4))/8=3$ m.", "重心位置は3 mです。", 2),
    "forces-free-body-diagrams": make("A book rests on a table. Name the two forces acting on the book.", "Gravity acts downward and the table's normal force acts upward.", "重力が下向き、垂直抗力が上向きに働きます。", 1, "conceptual"),
    "newtons-third-law": make("A hand pushes a wall with 40 N. What force does the wall exert on the hand?", "The wall exerts 40 N in the opposite direction.", "壁は反対向きに40 Nの力を手へ及ぼします。", 1),
    "newtons-first-law": make("A puck moves at constant velocity on a frictionless surface. What is the net force?", "The net force is zero.", "合力は0です。", 1),
    "newtons-second-law": make("A net force of 18 N acts on a 6 kg object. Find its acceleration.", "$a=F/m=3$ m/s$^2$.", "加速度は3 m/s$^2$です。", 1),
    "gravitational-force": make("Find the gravitational force on a 5 kg mass near Earth's surface using $g=9.8$ m/s$^2$.", "$F_g=mg=49$ N downward.", "重力は下向き49 Nです。", 1),
    "kinetic-static-friction": make("A 10 kg block has $\\mu_k=0.20$ on a level surface. Use $g=10$ m/s$^2$ to find kinetic friction.", "$f_k=\\mu_kmg=20$ N.", "動摩擦力は20 Nです。", 2),
    "spring-forces": make("A spring with $k=200$ N/m is stretched 0.03 m. Find the restoring-force magnitude.", "$F=kx=6$ N.", "復元力の大きさは6 Nです。", 1),
    "resistive-forces": make("A falling object reaches terminal speed. Compare drag force and weight.", "They are equal in magnitude and opposite in direction.", "抵抗力と重力は大きさが等しく向きが反対です。", 2, "conceptual"),
    "circular-motion": make("A 2 kg mass moves at 4 m/s in a circle of radius 2 m. Find the net radial force.", "$F_r=mv^2/r=16$ N inward.", "中心向きの合力は16 Nです。", 2),
    "translational-kinetic-energy": make("Find the kinetic energy of a 3 kg object moving at 4 m/s.", "$K=mv^2/2=24$ J.", "運動エネルギーは24 Jです。", 1),
    work: make("A constant 10 N force acts parallel to a 3 m displacement. Find the work.", "$W=Fd=30$ J.", "仕事は30 Jです。", 1),
    "potential-energy": make("A 2 kg object is lifted 5 m. Use $g=10$ m/s$^2$ to find the change in gravitational potential energy.", "$\\Delta U=mgh=100$ J.", "重力位置エネルギーの増加は100 Jです。", 1),
    "conservation-energy": make("A ball drops from rest through 5 m. Use $g=10$ m/s$^2$ to find its speed just before impact.", "$mgh=mv^2/2$, so $v=10$ m/s.", "力学的エネルギー保存より速さは10 m/sです。", 2),
    power: make("A motor does 600 J of work in 3 s. Find its average power.", "$P=W/t=200$ W.", "平均仕事率は200 Wです。", 1),
    "linear-momentum": make("Find the momentum of a 4 kg cart moving east at 3 m/s.", "$p=mv=12$ kg m/s east.", "運動量は東向き12 kg m/sです。", 1),
    impulse: make("A 20 N force acts for 0.30 s. Find the impulse.", "$J=F\\Delta t=6$ N s.", "力積は6 N sです。", 1),
    "conservation-linear-momentum": make("A 2 kg cart at 4 m/s sticks to a 2 kg cart at rest. Find their final speed.", "$v_f=(2(4))/(2+2)=2$ m/s.", "運動量保存より最終速度は2 m/sです。", 2),
    collisions: make("In a perfectly inelastic collision, which quantity is conserved: momentum, kinetic energy, or both?", "Momentum is conserved, but kinetic energy generally is not.", "運動量は保存されますが、運動エネルギーは一般に保存されません。", 1, "conceptual"),
    "rotational-kinematics": make("A wheel starts from rest with angular acceleration 3 rad/s$^2$. Find $\\omega$ after 4 s.", "$\\omega=\\alpha t=12$ rad/s.", "角速度は12 rad/sです。", 1),
    "linear-rotational-motion": make("A wheel of radius 0.5 m rolls without slipping at $\\omega=6$ rad/s. Find its center-of-mass speed.", "$v=R\\omega=3$ m/s.", "重心速度は3 m/sです。", 2),
    torque: make("A 10 N force acts perpendicular to a lever arm 0.4 m long. Find the torque magnitude.", "$\\tau=rF=4$ N m.", "力のモーメントの大きさは4 N mです。", 1),
    "rotational-inertia": make("Two equal point masses are at radii $r$ and $2r$. Which contributes more to rotational inertia?", "The mass at $2r$ contributes four times as much because $I=mr^2$.", "$I=mr^2$ なので、$2r$ の質点は4倍寄与します。", 2, "conceptual"),
    "rotational-equilibrium": make("A 6 N force acts 2 m to the left of a pivot. What force 3 m to the right balances its torque?", "$6(2)=F(3)$, so $F=4$ N.", "力のモーメントのつり合いより $F=4$ Nです。", 2),
    "rotational-second-law": make("A net torque of 12 N m acts on an object with $I=3$ kg m$^2$. Find angular acceleration.", "$\\alpha=\\tau/I=4$ rad/s$^2$.", "角加速度は4 rad/s$^2$です。", 1),
    "rotational-kinetic-energy": make("A rotor has $I=2$ kg m$^2$ and $\\omega=5$ rad/s. Find rotational kinetic energy.", "$K=I\\omega^2/2=25$ J.", "回転運動エネルギーは25 Jです。", 1),
    "torque-work": make("A constant torque of 5 N m turns an axle through 3 rad. Find the work.", "$W=\\tau\\Delta\\theta=15$ J.", "仕事は15 Jです。", 1),
    "angular-momentum-impulse": make("A disk has $I=4$ kg m$^2$ and $\\omega=3$ rad/s. Find its angular momentum.", "$L=I\\omega=12$ kg m$^2$/s.", "角運動量は12 kg m$^2$/sです。", 1),
    "conservation-angular-momentum": make("A skater halves her rotational inertia with no external torque. What happens to angular speed?", "Angular speed doubles because $I\\omega$ is conserved.", "角運動量保存により角速度は2倍になります。", 2, "conceptual"),
    rolling: make("For a solid cylinder rolling without slipping, write its total kinetic energy.", "$K=mv^2/2+I\\omega^2/2$ with $v=R\\omega$.", "$K=mv^2/2+I\\omega^2/2$ で、$v=R\\omega$ です。", 2, "conceptual"),
    "orbiting-satellites": make("Write the equation that determines circular-orbit speed around mass $M$ at radius $r$.", "$GMm/r^2=mv^2/r$, so $v=\\sqrt{GM/r}$.", "$GMm/r^2=mv^2/r$ より、$v=\\sqrt{GM/r}$ です。", 2),
    "defining-shm": make("A force is $F=-kx$. Why is the motion simple harmonic?", "The restoring force is proportional to displacement and points toward equilibrium.", "復元力が変位に比例し、平衡点へ向くため単振動です。", 1, "conceptual"),
    "frequency-period-shm": make("A mass-spring system has $m=1$ kg and $k=4$ N/m. Find its period.", "$T=2\\pi\\sqrt{m/k}=\\pi$ s.", "周期は $\\pi$ 秒です。", 2),
    "representing-analyzing-shm": make("At the equilibrium position in SHM, which is greatest: speed or acceleration magnitude?", "Speed is greatest; acceleration is zero.", "平衡位置では速さが最大で、加速度は0です。", 1, "conceptual"),
    "energy-sho": make("A spring with $k=100$ N/m oscillates with amplitude 0.20 m. Find total energy.", "$E=kA^2/2=2$ J.", "全エネルギーは2 Jです。", 2),
    pendulums: make("Find the small-angle period of a simple pendulum of length 1 m using $g=9.8$ m/s$^2$.", "$T=2\\pi\\sqrt{L/g}\\approx2.0$ s.", "周期は約2.0秒です。", 2),
    "internal-structure-density": make("A 2 kg sample occupies 0.0005 m$^3$. Find its density.", "$\\rho=m/V=4000$ kg/m$^3$.", "密度は4000 kg/m$^3$です。", 1),
    pressure: make("A 200 N force acts uniformly on 0.50 m$^2$. Find pressure.", "$P=F/A=400$ Pa.", "圧力は400 Paです。", 1),
    "fluids-newtons-laws": make("A fully submerged object displaces fluid weighing 12 N. Find the buoyant force.", "By Archimedes' principle, the buoyant force is 12 N upward.", "アルキメデスの原理より、浮力は上向き12 Nです。", 1),
    "fluids-conservation-laws": make("Water speed is 2 m/s in a pipe of area 6 cm$^2$. Find the speed where area is 3 cm$^2$.", "$A_1v_1=A_2v_2$, so $v_2=4$ m/s.", "連続の式より $v_2=4$ m/sです。", 2),
  };
  const key = id === "scalars-vectors-one-dimension" && calculusBased ? "scalars-vectors" : id;
  return items[key] ?? make(`Solve one short problem using only ${topic.name.en}.`, `Apply the defining law for ${topic.name.en} and include units and direction where relevant.`, `${topic.name.ja} の基本法則だけを使い、必要に応じて単位と向きを示します。`, 2, "free-response");
}

function electromagnetism(topic) {
  const id = topic.id;
  const items = {
    "electric-charge-force": make("Two charges $+2\\,\\mu$C and $+3\\,\\mu$C are separated by distance $r$. Write the force magnitude.", "$F=k(2\\times10^{-6})(3\\times10^{-6})/r^2$; the force is repulsive.", "クーロン力は $F=k(2\\times10^{-6})(3\\times10^{-6})/r^2$ で、反発力です。", 2),
    "charge-conservation-charging": make("A neutral object loses $5\\times10^{12}$ electrons. What sign of charge does it acquire?", "It becomes positively charged because it lost negative charge.", "負電荷を失ったので正に帯電します。", 1, "conceptual"),
    "electric-fields": make("Find the electric-field magnitude a distance $r$ from a point charge $Q$.", "$E=k|Q|/r^2$.", "$E=k|Q|/r^2$ です。", 1),
    "fields-charge-distributions": make("Write an integral expression for the electric field from a continuous line charge.", "$d\\mathbf E=k\\,dq\\,\\hat{r}/r^2$ and $\\mathbf E=\\int d\\mathbf E$, with $dq=\\lambda\\,d\\ell$.", "$dq=\\lambda d\\ell$ とし、$d\\mathbf E$ を分布全体で積分します。", 3),
    "electric-flux": make("A uniform field $E$ passes through a flat area $A$ at angle $\\theta$ to the area vector. Find flux.", "$\\Phi_E=EA\\cos\\theta$.", "$\\Phi_E=EA\\cos\\theta$ です。", 1),
    "gauss-law": make("A closed surface encloses charge $3Q$. Find its net electric flux.", "$\\Phi_E=3Q/\\varepsilon_0$.", "正味の電束は $3Q/\\varepsilon_0$ です。", 1),
    "electric-potential-energy": make("Write the potential energy of two point charges $q_1$ and $q_2$ separated by $r$.", "$U=kq_1q_2/r$.", "$U=kq_1q_2/r$ です。", 1),
    "electric-potential": make("Find the electric potential a distance $r$ from a point charge $Q$.", "$V=kQ/r$.", "$V=kQ/r$ です。", 1),
    "conservation-electric-energy": make("A positive charge is released from rest and moves to lower electric potential. What happens to its kinetic energy?", "Its electric potential energy decreases and kinetic energy increases.", "電気的位置エネルギーが減少し、運動エネルギーが増加します。", 1, "conceptual"),
    "electrostatics-conductors": make("What is the electric field inside a conductor in electrostatic equilibrium?", "It is zero.", "0です。", 1, "conceptual"),
    "charge-redistribution": make("Identical conducting spheres carry $+6Q$ and $-2Q$. They touch and separate. Find each final charge.", "Total charge is $4Q$, shared equally, so each sphere has $+2Q$.", "全電荷 $4Q$ を等分するので、それぞれ $+2Q$ です。", 2),
    capacitors: make("A capacitor has $Q=12\\,\\mu$C and $V=3$ V. Find capacitance.", "$C=Q/V=4\\,\\mu$F.", "静電容量は $4\\,\\mu$Fです。", 1),
    dielectrics: make("An isolated charged capacitor is filled with a dielectric of constant $\\kappa$. What happens to capacitance?", "The capacitance increases by a factor of $\\kappa$.", "静電容量は $\\kappa$ 倍になります。", 1, "conceptual"),
    "electric-current": make("A charge of 15 C passes a point in 3 s. Find current.", "$I=Q/t=5$ A.", "電流は5 Aです。", 1),
    "simple-circuits": make("A 6 V battery is connected across a 3 $\\Omega$ resistor. Find current.", "$I=V/R=2$ A.", "電流は2 Aです。", 1),
    "resistance-resistivity-ohms-law": make("A wire has resistivity $\\rho$, length $L$, and area $A$. Write its resistance.", "$R=\\rho L/A$.", "$R=\\rho L/A$ です。", 1),
    "electric-power": make("A device uses 12 V and 2 A. Find its power.", "$P=IV=24$ W.", "電力は24 Wです。", 1),
    "compound-dc-circuits": make("Two resistors, 4 $\\Omega$ and 6 $\\Omega$, are in series. Find equivalent resistance.", "$R_{eq}=10\\,\\Omega$.", "合成抵抗は10 $\\Omega$です。", 1),
    "kirchhoff-loop": make("A loop contains a 12 V battery and resistors 2 $\\Omega$ and 4 $\\Omega$ in series. Find current.", "$12-I(2)-I(4)=0$, so $I=2$ A.", "ループ則より $12-6I=0$、したがって $I=2$ Aです。", 2),
    "kirchhoff-junction": make("At a junction, 5 A enters and 2 A leaves through one branch. Find the current leaving through the other branch.", "$5=2+I$, so $I=3$ A.", "接点則より、もう一方から出る電流は3 Aです。", 1),
    "rc-circuits": make("Write the time constant of an RC circuit.", "$\\tau=RC$.", "$\\tau=RC$ です。", 1),
    "magnetic-fields": make("Which direction does the magnetic field point around a straight wire carrying current upward?", "It circles the wire according to the right-hand rule.", "右ねじの法則に従って導線の周囲を円状に向きます。", 1, "conceptual"),
    "magnetism-moving-charges": make("A charge $q$ moves perpendicular to field $B$ with speed $v$. Find magnetic-force magnitude.", "$F=|q|vB$.", "$F=|q|vB$ です。", 1),
    "fields-current-wires-biot-savart": make("State the distance dependence of the magnetic field from a long straight wire.", "$B=\\mu_0I/(2\\pi r)$, so it decreases as $1/r$.", "$B=\\mu_0I/(2\\pi r)$ で、距離に反比例します。", 2),
    "amperes-law": make("Write Ampère's law for a closed path.", "$\\oint\\mathbf B\\cdot d\\boldsymbol\\ell=\\mu_0I_{enc}$.", "$\\oint\\mathbf B\\cdot d\\boldsymbol\\ell=\\mu_0I_{enc}$ です。", 2, "conceptual"),
    "magnetic-flux": make("A uniform field $B$ passes through area $A$ at angle $\\theta$ to the area vector. Find magnetic flux.", "$\\Phi_B=BA\\cos\\theta$.", "$\\Phi_B=BA\\cos\\theta$ です。", 1),
    "electromagnetic-induction": make("Magnetic flux through a loop changes by $0.6$ Wb in $0.2$ s. Find the induced-emf magnitude.", "$|\\mathcal E|=|\\Delta\\Phi_B/\\Delta t|=3$ V.", "誘導起電力の大きさは3 Vです。", 2),
    "induced-currents-forces": make("A north pole approaches a conducting loop. What does the induced current do?", "It creates a magnetic field that opposes the increase in flux, in accordance with Lenz's law.", "レンツの法則により、磁束の増加を妨げる磁場を作ります。", 2, "conceptual"),
    inductance: make("Write the energy stored in an inductor carrying current $I$.", "$U_L=LI^2/2$.", "$U_L=LI^2/2$ です。", 1),
    "lr-circuits": make("Write the time constant of an LR circuit.", "$\\tau=L/R$.", "$\\tau=L/R$ です。", 1),
    "lc-circuits": make("Write the angular frequency of an ideal LC circuit.", "$\\omega=1/\\sqrt{LC}$.", "$\\omega=1/\\sqrt{LC}$ です。", 2),
  };
  return items[id] ?? make(`Solve one short problem using only ${topic.name.en}.`, `Apply the defining law for ${topic.name.en} and state units and direction.`, `${topic.name.ja} の基本法則を使い、単位と向きを示します。`, 2, "free-response");
}

function templateFor(courseId, topic) {
  if (courseId === "ap-precalc") return precalculus(topic);
  if (courseId === "ap-calc-ab" || courseId === "ap-calc-bc") return calculus(topic);
  if (courseId === "ap-physics-1") return mechanics(topic, false);
  if (courseId === "ap-physics-c-mech") return mechanics(topic, true);
  return electromagnetism(topic);
}

const levelNames = {
  1: "Foundation",
  2: "Direct Practice",
  3: "Reasoning",
  4: "Validity Check",
  5: "Challenge",
};

function bilingualTerm(value) {
  if (!value.en.includes(",") && value.en.split(" and ").length === 2 && value.ja.split("と").length === 2) {
    const [jaFirst, jaSecond] = value.ja.split("と");
    const [enFirst, enSecond] = value.en.split(" and ");
    return `${jaFirst}（${enFirst}）と${jaSecond}（${enSecond}）`;
  }
  if (!value.en.includes(":") && value.en.includes(",") && value.ja.includes("・")) {
    const englishParts = value.en.split(/,\s*(?:and\s+)?/);
    const japaneseParts = value.ja.split("・");
    if (englishParts.length === japaneseParts.length) {
      return japaneseParts.map((part, index) => `${part}（${englishParts[index]}）`).join("・");
    }
  }
  return `${value.ja}（${value.en}）`;
}

function versionFor(content, topic, difficulty) {
  if (difficulty === content.difficulty) return content;
  if (difficulty === 1) return {
    ...content,
    difficulty,
    questionType: "conceptual",
    question: `Name the single rule, definition, or physical law that should be used first for this prompt. Do not solve the full problem.\n\n${content.question}`,
    solution: `Use ${topic.name.en}. The purpose of this foundation check is to recognize the governing idea before calculating.`,
    solutionJa: `最初に使うのは「${topic.name.ja}」の基本関係です。このレベルでは、計算前に使う考え方を正しく選べれば十分です。`,
  };
  if (difficulty === 2) return {
    ...content,
    difficulty,
    questionType: content.questionType === "free-response" ? "calculation" : content.questionType,
    question: `Solve this direct, single-topic problem.\n\n${content.question}`,
  };
  if (difficulty === 3) return {
    ...content,
    difficulty,
    questionType: "free-response",
    question: `Solve the following problem and justify the one step where ${topic.name.en} is used.\n\n${content.question}`,
    solution: `${content.solution}\n\nThe required justification is the defining relationship or condition from ${topic.name.en}.`,
    solutionJa: `${content.solutionJa}\n\n根拠として「${topic.name.ja}」の定義となる関係または適用条件を明記します。`,
  };
  if (difficulty === 4) return {
    ...content,
    difficulty,
    questionType: "conceptual",
    question: `For the prompt below, state the most important domain, sign, direction, unit, or theorem-condition check that must be made before accepting a solution.\n\n${content.question}`,
    solution: `First obtain the focused result: ${content.solution}\n\nThen verify that the assumptions and conditions required by ${topic.name.en} are satisfied. A numerical result without that check is incomplete.`,
    solutionJa: `まず基本結果を得ます。${content.solutionJa}\n\nそのうえで「${topic.name.ja}」の適用条件、定義域、符号、向き、単位のうち該当するものを確認します。`,
  };
  return {
    ...content,
    difficulty,
    questionType: "free-response",
    question: `Solve the following problem from first principles. Keep the work focused on ${topic.name.en}, and do not quote a memorized answer without deriving it.\n\n${content.question}`,
    solution: `${content.solution}\n\nA complete challenge-level response derives this result from the governing definition or law, rather than only stating the final value.`,
    solutionJa: `${content.solutionJa}\n\n難易度5では、最終結果だけでなく「${topic.name.ja}」の定義や法則から結果を導く過程まで示します。`,
  };
}

for (const courseId of courseIds) {
  const problemFolder = join(root, "src/data/problems", courseId);
  const referenceFolder = join(root, "src/data/references", courseId);
  const authored = read(`src/data/problems/${courseId}/problems.json`);
  const authoredReferences = read(`src/data/references/${courseId}/references.json`);
  const referenceByTopic = new Map(
    authoredReferences.map((reference) => [`${reference.unit}/${reference.topic}`, reference.id]),
  );
  for (const unit of unitsForCourse(courseId)) {
    for (const topic of unit.topics) {
      const key = `${unit.id}/${topic.id}`;
      if (!referenceByTopic.has(key)) {
        referenceByTopic.set(key, `${courseId}-${topic.code.replace(".", "-")}-reference`);
      }
    }
  }
  const authoredLevels = new Map();
  for (const problem of authored) {
    const key = `${problem.unit}/${problem.topic}`;
    if (!authoredLevels.has(key)) authoredLevels.set(key, new Set());
    authoredLevels.get(key).add(problem.difficulty);
  }
  const generated = [];
  for (const unit of unitsForCourse(courseId)) {
    for (const topic of unit.topics) {
      const existing = authoredLevels.get(`${unit.id}/${topic.id}`) ?? new Set();
      const baseContent = templateFor(courseId, topic);
      for (const difficulty of [1, 2, 3, 4, 5]) {
        if (existing.has(difficulty)) continue;
        const content = versionFor(baseContent, topic, difficulty);
        generated.push({
          id: `${courseId}-${topic.code.replace(".", "-")}-d${difficulty}`,
          course: courseId,
          unit: unit.id,
          topic: topic.id,
          title: {
            en: `${topic.name.en} - ${levelNames[difficulty]}`,
            ja: `${topic.name.ja} - ${levelNames[difficulty]}`,
          },
          difficulty,
          questionType: content.questionType,
          question: { en: content.question, ja: content.question },
          solution: { en: content.solution, ja: content.solutionJa },
          tags: [topic.id, "focused-practice", `difficulty-${difficulty}`],
          relatedReferences: [referenceByTopic.get(`${unit.id}/${topic.id}`)],
        });
      }
    }
  }
  const allProblems = [...authored, ...generated];
  const generatedReferences = [];
  const authoredReferenceTopics = new Set(
    authoredReferences.map((reference) => `${reference.unit}/${reference.topic}`),
  );
  for (const unit of unitsForCourse(courseId)) {
    for (const topic of unit.topics) {
      const key = `${unit.id}/${topic.id}`;
      if (authoredReferenceTopics.has(key)) continue;
      const baseContent = templateFor(courseId, topic);
      const relatedProblems = allProblems
        .filter((problem) => problem.unit === unit.id && problem.topic === topic.id)
        .map((problem) => problem.id);
      const content = [
        `Core idea: ${topic.name.en} is a focused skill in ${unit.name.en}. Learn the governing definition, relationship, or procedure before combining it with other topics.`,
        `How to use it: identify the quantities and conditions in the prompt, choose the relationship specific to ${topic.name.en}, carry out one clear step at a time, and state the result with any required units, domain, sign, or direction.`,
        `Worked checkpoint: ${baseContent.question}`,
        `Reasoning: ${baseContent.solution}`,
        `Self-check: explain why the selected relationship applies. Then check the result against the assumptions of the problem. A correct calculation without the relevant condition or interpretation is incomplete.`,
      ].join("\n");
      const bilingualTopic = bilingualTerm(topic.name);
      const contentJa = [
        `基本的な考え方：${bilingualTopic}は、${unit.name.en}で扱う重要な学習項目です。まず定義、関係式、または解法の手順を確認し、その後に他のTopicと組み合わせます。`,
        `使い方：問題で与えられた量と条件を整理し、${bilingualTopic}に対応する関係を選びます。計算は1段階ずつ進め、最後に単位、定義域、符号、向きのうち必要なものを確認します。`,
        `計算・推論の例：${baseContent.solutionJa}`,
        `セルフチェック：選んだ関係式や法則がなぜ使えるかを説明し、結果が問題の条件と矛盾していないかを確認します。数値だけでなく、条件や物理的・数学的な意味も答えましょう。`,
      ].join("\n");
      generatedReferences.push({
        id: referenceByTopic.get(key),
        course: courseId,
        unit: unit.id,
        topic: topic.id,
        title: { en: topic.name.en, ja: topic.name.ja },
        description: {
          en: `Core idea, method, and worked checkpoint for ${topic.name.en}.`,
          ja: `${bilingualTopic}の基本概念、使い方、確認例を説明します。`,
        },
        content: { en: content, ja: contentJa },
        tags: [topic.id, "concept-guide", "worked-example"],
        relatedProblems,
      });
    }
  }
  writeFileSync(join(problemFolder, "coverage.json"), `${JSON.stringify(generated, null, 2)}\n`);
  writeFileSync(join(referenceFolder, "coverage.json"), `${JSON.stringify(generatedReferences, null, 2)}\n`);
  console.log(`${courseId}: ${generated.length} generated problems, ${generatedReferences.length} generated references`);
}
