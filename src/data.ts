// @ts-nocheck
export const R = String.raw;

export const STARTER = `#include <stdio.h>

void main()
{
    // write your code here
}
`;

export const HELLO_STARTER = `#include <stdio.h>

void main()
{
    printf("Hello, Celler!\\n");
}
`;

export const SNIPS: any[] = [];

export function escH(s: any) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const HLRE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])')|(#\s*\w+[^\n]*)|\b(int|float|double|char|void|long|short|unsigned|signed|const|if|else|while|do|for|switch|case|default|break|continue|return|sizeof)\b|\b(\d+\.?\d*[fF]?)\b|\b([A-Za-z_]\w*)(?=\s*\()/g;

export function hl(src: string) {
  let out = '', last = 0, m; HLRE.lastIndex = 0;
  while ((m = HLRE.exec(src))) {
    out += escH(src.slice(last, m.index));
    const c = m[1] ? 'c-com' : (m[2] || m[3]) ? 'c-str' : m[4] ? 'c-pre' : m[5] ? 'c-kw' : m[6] ? 'c-num' : 'c-fn';
    out += '<span class="' + c + '">' + escH(m[0]) + '</span>'; last = HLRE.lastIndex;
  }
  return out + escH(src.slice(last));
}

export function code(src: string, o?: any) {
  o = o || {}; src = src.replace(/^\n/, '').replace(/\s+$/, '');
  const id = SNIPS.push({ code: src, input: o.input || '', title: o.title || 'Example' }) - 1;
  return '<div class="codebox"><div class="codebar"><span>C code</span>' + (o.noRun ? '' : '<button class="mini" data-snip="' + id + '">▶ Run in Lab</button>') + '</div><pre><code>' + hl(src) + '</code></pre>' + (o.input ? '<div class="codein">Sample input: <code>' + escH(o.input) + '</code></div>' : '') + '</div>';
}

export const bio = (h: string) => '<div class="callout bio"><b>Bio-brain translation</b><div>' + h + '</div></div>';
export const tip = (h: string) => '<div class="callout tip"><b>Celler says</b><div>' + h + '</div></div>';
export const trap = (h: string) => '<div class="callout trap"><b>Exam trap</b><div>' + h + '</div></div>';

export function fcNodes(a: any[]): string {
  return a.map((n) => {
    if (n === 'S') return '<div class="fc-n fc-t">Start</div>';
    if (n === 'E') return '<div class="fc-n fc-t">Stop</div>';
    const t = n[1];
    if (n[0] === 'io') return '<div class="fc-n fc-io"><span>' + t + '</span></div>';
    if (n[0] === 'p') return '<div class="fc-n fc-p">' + t + '</div>';
    const isLoop = n[0] === 'loop';
    const bot = '<div class="fc-bot"></div>';
    return '<div class="fc-n fc-d"><span>' + t + '</span></div><div class="fc-split"><div class="fc-col"><div class="fc-lab">Yes</div>' + fcNodes(n[2]) + (isLoop ? '<div class="fc-back">↺ go back to the question</div>' : bot) + '</div><div class="fc-col"><div class="fc-lab">No</div>' + fcNodes(n[3]) + bot + '</div></div><div class="fc-join' + (isLoop ? ' r' : '') + '"></div><div class="fc-merge"></div>';
  }).join('<div class="fc-a"></div>');
}

export const flow = (nodes: any[], cap?: string) => '<figure class="flow"><div class="fc">' + fcNodes(nodes) + '</div>' + (cap ? '<figcaption>' + cap + '</figcaption>' : '') + '</figure>';

/* ===== LESSONS (All with void main()) ===== */
export const LESSONS = [
{
  id: 'computer', mod: 1, emoji: '🖥️', title: 'Inside the Computer', color: '#14B8A6',
  blurb: 'Input, output, memory, CPU and the three translators.',
  celler: 'A computer is a team: input brings data in, the processor works on it, memory stores it, output shows the result. A translator turns your C code into 0s and 1s the machine understands.',
  sections: [
    { h: 'Five parts, one team', html: `
      <p>Every computer has the same basic parts. Data comes in through <b>Input</b>, the <b>Processor</b> works on it, <b>Memory</b> stores it, and the answer leaves through <b>Output</b>.</p>
      <div class="blocks"><div class="blk bi">Input<small>keyboard, mouse</small></div><div class="arr">➜</div>
        <div class="blk bc"><b>Processor (CPU)</b><div class="sub"><span>Registers</span><span>ALU</span><span>CU</span></div></div><div class="arr">➜</div>
        <div class="blk bo">Output<small>screen, printer</small></div>
        <div class="blk bm">Memory<small>stores data and instructions</small></div></div>
      <ul><li><b>ALU</b> = Arithmetic Logic Unit (+, −, ×, comparisons).</li>
      <li><b>CU</b> = Control Unit. Coordinates all operations.</li></ul>
      ${bio('Like a cell: receptors bring signals (input), nucleus coordinates (CU), ribosomes build (ALU), cytoplasm stores (memory), secretions are output.')}` },
    { h: 'Registers & Memory', html: `
      <p>Key processor registers:</p>
      <table class="tbl"><tr><th>Register</th><th>What it holds</th></tr>
      <tr><td>Program Counter (PC)</td><td>Address of the <b>next</b> instruction to execute.</td></tr>
      <tr><td>Instruction Register (IR)</td><td>The <b>current</b> instruction being processed.</td></tr>
      <tr><td>Address Register (AR)</td><td>Address being accessed by an instruction.</td></tr></table>
      <h4>Units of memory</h4>
      <p>1 byte = 8 bits, 1 KB = 1024 bytes (2<sup>10</sup>), 1 MB = 2<sup>20</sup> bytes.</p>` },
    { h: 'Translators: Assembler, Compiler, Interpreter', html: `
      <table class="tbl"><tr><th>Translator</th><th>What it does</th></tr>
      <tr><td>Assembler</td><td>Converts assembly language into machine code.</td></tr>
      <tr><td>Compiler</td><td>Converts whole program at once; produces <b>object code</b>.</td></tr>
      <tr><td>Interpreter</td><td>Translates line by line; no object code.</td></tr></table>
      <p>C uses a compiler (like <code>gcc</code>).</p>` }
  ],
  quiz: [
    { q: 'Which part of the processor performs calculations and comparisons?', o: ['Control Unit', 'ALU', 'Program Counter', 'Cache'], a: 1, w: 'ALU calculates and compares.' },
    { q: 'The Program Counter stores…', o: ['the current instruction', 'the result of calculation', 'the address of the next instruction', 'the program name'], a: 2, w: 'PC = address of next instruction.' },
    { q: 'How many bits are in a byte?', o: ['4', '8', '16', '1024'], a: 1, w: '1 byte = 8 bits.' },
    { q: 'Which translator produces object code and translates all at once?', o: ['Interpreter', 'Assembler', 'Compiler', 'Editor'], a: 2, w: 'Compiler translates the whole program.' }
  ]
},
{
  id: 'algo', mod: 1, emoji: '🗺️', title: 'Algorithms & Flowcharts', color: '#6B4EFF',
  blurb: 'Step-by-step logic, flowchart shapes and planning.',
  celler: 'An algorithm is a step-by-step recipe that solves a task. A flowchart is the same recipe drawn as shapes. Always plan with void main() in mind!',
  sections: [
    { h: 'Algorithm Characteristics', html: `
      <p>An <b>algorithm</b> has 5 characteristics: Input (≥0), Output (≥1), Finiteness (terminates), Definiteness (clear steps), Effectiveness (realizable).</p>
      <h4>Example: Add two integers</h4>
      <ol class="steps"><li>Start</li><li>Read two integers A and B</li><li>Sum = A + B</li><li>Display Sum</li><li>Stop</li></ol>` },
    { h: 'Flowchart symbols', html: `
      <div class="legend"><div><span class="fc-n fc-t">Start / Stop</span>Oval: begin/end</div><div><span class="fc-n fc-io"><span>Read / Print</span></span>Parallelogram: I/O</div><div><span class="fc-n fc-p">Sum = A + B</span>Rectangle: process</div><div><span class="fc-n fc-d"><span>A &gt; B ?</span></span>Diamond: decision</div></div>
      ${flow(['S', ['io', 'Read A and B'], ['p', 'Sum = A + B'], ['io', 'Display Sum'], 'E'], 'Add two numbers')}` }
  ],
  quiz: [
    { q: 'Which shape represents a decision in a flowchart?', o: ['Oval', 'Rectangle', 'Parallelogram', 'Diamond'], a: 3, w: 'Diamond = decision with Yes/No exits.' },
    { q: 'Which shape is used for Read and Print?', o: ['Parallelogram', 'Oval', 'Diamond', 'Rectangle'], a: 0, w: 'Parallelogram = input/output.' }
  ]
},
{
  id: 'first', mod: 1, emoji: '👋', title: 'Your First C Program', color: '#FF5C8A',
  blurb: 'void main(), printf, scanf, headers and program structure.',
  celler: 'Every program in our syllabus starts with void main()! printf displays to screen, scanf reads keyboard input.',
  sections: [
    { h: 'Hello, World with void main()', html: `
      <p>In our academic syllabus, we write <code>void main()</code> without a return statement:</p>
      ${code(R`
// Program to print "Hello, World!"
#include <stdio.h>

void main()
{
    printf("Hello, World!");
}`, { title: 'Hello World with void main()' })}
      <h4>Key components:</h4>
      <ul><li><code>#include &lt;stdio.h&gt;</code>: Standard I/O header file.</li>
      <li><code>void main()</code>: Starting point of program execution. <code>void</code> indicates main does not return any value.</li>
      <li><code>printf(...)</code>: Prints formatted output to screen.</li>
      <li><code>;</code>: Delimiter ending each statement.</li></ul>
      ${tip('Our syllabus strictly uses <code>void main()</code>. You do not need <code>return 0;</code> inside <code>void main()</code>.')}` },
    { h: 'Reading input with scanf', html: `
      ${code(R`
// Finding the sum of two numbers
#include <stdio.h>

void main()
{
    int a, b, sum;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    sum = a + b;
    printf("Sum = %d", sum);
}`, { input: '7 5', title: 'Sum of two numbers' })}
      ${trap('Always use <code>&amp;</code> before variable names in <code>scanf("%d", &amp;a)</code>. It provides the memory address.')}` }
  ],
  quiz: [
    { q: 'Which line is the starting point of our C programs?', o: ['#include <stdio.h>', 'void main()', 'printf()', 'scanf()'], a: 1, w: 'Execution begins at void main().' },
    { q: 'Which format specifier reads and prints an int?', o: ['%f', '%c', '%d', '%s'], a: 2, w: '%d is for integers.' },
    { q: 'Which is the correct way to read an integer n?', o: ['scanf("%d", n);', 'scanf("%d", &n);', 'scanf("%f", &n);', 'scanf(&n);'], a: 1, w: 'scanf requires &n to store at the variable address.' }
  ]
},
{
  id: 'tokens', mod: 1, emoji: '🧱', title: 'Tokens & Data Types', color: '#F59E0B',
  blurb: 'Keywords, identifiers, constants and primitive types.',
  celler: 'Tokens are the smallest units in C. Data types like int, float, and char store your numbers and letters.',
  sections: [
    { h: 'Tokens & Identifiers', html: `
      <p>Types of tokens: Keywords (32), Identifiers, Constants, Strings, Operators, Special symbols.</p>
      <div class="widget" data-widget="idcheck"></div>` },
    { h: 'Data types in C', html: `
      <table class="tbl"><tr><th>Type</th><th>Stores</th><th>Typical size</th><th>Specifier</th></tr>
      <tr><td><code>int</code></td><td>Whole numbers</td><td>4 bytes</td><td><code>%d</code></td></tr>
      <tr><td><code>float</code></td><td>Decimals</td><td>4 bytes</td><td><code>%f</code></td></tr>
      <tr><td><code>double</code></td><td>Precision decimals</td><td>8 bytes</td><td><code>%lf</code></td></tr>
      <tr><td><code>char</code></td><td>Single character</td><td>1 byte</td><td><code>%c</code></td></tr></table>
      ${code(R`
// Volume of a sphere
#include <stdio.h>
#include <math.h>
#define PI 3.1416

void main()
{
    float rad, vols;
    printf("Enter radius: ");
    scanf("%f", &rad);
    vols = 4 * PI * pow(rad, 3) / 3;
    printf("Volume of sphere = %f", vols);
}`, { input: '3', title: 'Sphere volume' })}` }
  ],
  quiz: [
    { q: 'How many keywords are there in ANSI C?', o: ['16', '24', '32', '64'], a: 2, w: 'There are 32 standard keywords in C.' },
    { q: 'What is the result of 5/9 when both are integers in C?', o: ['0.555', '0', '1', '5'], a: 1, w: 'Integer division truncates the decimal portion, resulting in 0.' }
  ]
},
{
  id: 'operators', mod: 1, emoji: '➕', title: 'Operators', color: '#0EA5E9',
  blurb: 'Arithmetic, logical, relational, ternary, and bitwise.',
  celler: 'Remember: % gives remainder, = assigns, == compares, and ++ adds one!',
  sections: [
    { h: 'The Operator Families', html: `
      <p>Arithmetic (<code>+ - * / %</code>), Relational (<code>&lt; &gt; == != &lt;= &gt;=</code>), Logical (<code>&amp;&amp; || !</code>), Increment/Decrement (<code>++ --</code>), Ternary (<code>? :</code>).</p>
      <div class="widget" data-widget="exprplay"></div>` },
    { h: 'Pre-increment vs Post-increment', html: `
      ${code(R`
#include <stdio.h>

void main()
{
    int a = 5, b, c;
    b = a++;
    printf("b = %d, a = %d\\n", b, a);
    a = 5;
    c = ++a;
    printf("c = %d, a = %d\\n", c, a);
}`, { title: 'Pre vs post increment' })}` }
  ],
  quiz: [
    { q: 'What is 17 % 5?', o: ['3', '2', '3.4', '0'], a: 1, w: '17 divided by 5 leaves remainder 2.' },
    { q: 'Which operator checks equality?', o: ['=', '==', '!=', ':='], a: 1, w: '== checks equality; = is assignment.' }
  ]
},
{
  id: 'if', mod: 2, emoji: '🔀', title: 'Decisions: if / else', color: '#EF4444',
  blurb: 'Simple if, if-else, nested if and else-if ladder.',
  celler: 'Control flow lets your program make choices. Use == for comparisons!',
  sections: [
    { h: 'Decision structures with void main()', html: `
      ${code(R`
// odd or even
#include <stdio.h>

void main()
{
    int num;
    printf("Enter your number: \\n");
    scanf("%d", &num);
    if (num % 2 == 0)
    {
        printf("%d is even!\\n", num);
    }
    else
    {
        printf("%d is odd!\\n", num);
    }
}`, { input: '8', title: 'Odd or even' })}` }
  ],
  quiz: [
    { q: 'What does if (x = 5) do?', o: ['Compares x to 5', 'Assigns 5 to x and evaluates to true', 'Gives syntax error', 'Checks if x > 5'], a: 1, w: 'A single = assigns and returns 5 (true). Use == to compare.' }
  ]
},
{
  id: 'switch', mod: 2, emoji: '🎛️', title: 'switch-case', color: '#8B5CF6',
  blurb: 'Multi-way branching, break statement, and fall-through.',
  celler: 'switch cleanly selects one branch among many. Remember break!',
  sections: [
    { h: 'Day of the week with void main()', html: `
      ${code(R`
// day of the week
#include <stdio.h>

void main()
{
    int day;
    printf("Enter a value (1-7): ");
    scanf("%d", &day);
    switch (day)
    {
        case 1: printf("\\nSunday");    break;
        case 2: printf("\\nMonday");    break;
        case 3: printf("\\nTuesday");   break;
        case 4: printf("\\nWednesday"); break;
        case 5: printf("\\nThursday");  break;
        case 6: printf("\\nFriday");    break;
        case 7: printf("\\nSaturday");  break;
        default: printf("\\nEnter a valid number!"); break;
    }
}`, { input: '4', title: 'Day of week' })}` }
  ],
  quiz: [
    { q: 'What is the role of break in switch?', o: ['Restart program', 'Exit from switch block', 'Skip default', 'Print error'], a: 1, w: 'break exits from the switch statement immediately.' }
  ]
},
{
  id: 'loops', mod: 2, emoji: '🔁', title: 'Loops: while, do-while, for', color: '#10B981',
  blurb: 'Repeating code: while, do-while and for loops.',
  celler: 'Loops repeat code while a condition is true. Ensure the loop variable is updated!',
  sections: [
    { h: 'Loops with void main()', html: `
      ${code(R`
// sum of first 100 natural numbers
#include <stdio.h>

void main()
{
    int i, sum = 0;
    for (i = 1; i <= 100; i++)
    {
        sum = sum + i;
    }
    printf("Sum = %d", sum);
}`, { title: 'For loop sum' })}` }
  ],
  quiz: [
    { q: 'Which loop always executes its body at least once?', o: ['while', 'for', 'do-while', 'none'], a: 2, w: 'do-while evaluates condition after body execution.' }
  ]
},
{
  id: 'breakcont', mod: 2, emoji: '✂️', title: 'break & continue', color: '#EC4899',
  blurb: 'Exiting loops and skipping iterations.',
  celler: 'break exits the loop completely; continue skips to the next iteration.',
  sections: [
    { h: 'break vs continue with void main()', html: `
      ${code(R`
#include <stdio.h>

void main()
{
    int i;
    printf("With break:\\t");
    for (i = 0; i < 6; i++)
    {
        if (i == 4) break;
        printf("%d\\t", i);
    }
    printf("\\nWith continue:\\t");
    for (i = 0; i < 6; i++)
    {
        if (i == 4) continue;
        printf("%d\\t", i);
    }
}`, { title: 'break vs continue' })}` }
  ],
  quiz: [
    { q: 'What does continue do inside a loop?', o: ['Exits loop', 'Skips to next iteration', 'Restarts main', 'Pauses execution'], a: 1, w: 'continue skips the rest of the current iteration.' }
  ]
}
];

/* ===== QUESTION BANK: Algorithms ===== */
export const ALGOS = [
  { id: 'a1', title: 'Hello World', q: 'Design an algorithm to display “Hello World” on the screen.', steps: ['Start', 'Display “Hello World” on the screen', 'Stop'], flow: ['S', ['io', 'Display “Hello World”'], 'E'] },
  { id: 'a2', title: 'Add two integers', q: 'Write an algorithm and draw a flowchart to add two integer numbers.', steps: ['Start', 'Read two integers A and B', 'Sum = A + B', 'Display Sum', 'Stop'], flow: ['S', ['io', 'Read integers A and B'], ['p', 'Sum = A + B'], ['io', 'Display Sum'], 'E'] },
  { id: 'a3', title: 'Square and cube', q: 'Write an algorithm and draw a flowchart to display the square and cube of an integer.', steps: ['Start', 'Read an integer A', 'Square = A × A', 'Cube = Square × A', 'Display Square and Cube', 'Stop'], flow: ['S', ['io', 'Read integer A'], ['p', 'Square = A × A<br>Cube = Square × A'], ['io', 'Display Square and Cube'], 'E'] },
  { id: 'a4', title: 'Largest of two numbers', q: 'Write an algorithm and draw a flowchart for finding the largest of two numbers.', steps: ['Start', 'Read two integers num1 and num2', 'If num1 > num2 then print “num1 is largest” and go to step 5', 'Otherwise print “num2 is largest”', 'Stop'], flow: ['S', ['io', 'Read num1 and num2'], ['d', 'num1 &gt; num2 ?', [['io', 'Print “num1 is largest”']], [['io', 'Print “num2 is largest”']]], 'E'] },
  { id: 'a5', title: 'Vowel or consonant', q: 'Check whether the given alphabet is a vowel or consonant.', steps: ['Start', 'Read a character C', 'Convert C to uppercase', 'If C = A, E, I, O or U print Vowel, else Consonant', 'Stop'], flow: ['S', ['io', 'Read character C'], ['p', 'Convert C to uppercase'], ['d', 'C = A, E, I, O or U ?', [['io', 'Print “Vowel”']], [['io', 'Print “Consonant”']]], 'E'] },
  { id: 'a6', title: 'Average of three numbers', q: 'Find the average of three numbers read from user.', steps: ['Start', 'Read num1, num2, num3', 'Sum = num1 + num2 + num3', 'Avg = Sum / 3.0', 'Print Avg', 'Stop'], flow: ['S', ['io', 'Read 3 numbers'], ['p', 'Sum = n1+n2+n3<br>Avg = Sum/3.0'], ['io', 'Print Avg'], 'E'] },
  { id: 'a7', title: 'Factorial of a number', q: 'Find the factorial of a number.', steps: ['Start', 'Read integer n', 'Initialize i = 1, Fac = 1', 'While i ≤ n: Fac = Fac × i; i = i + 1', 'Print Fac', 'Stop'], flow: ['S', ['io', 'Read integer n'], ['p', 'i = 1, Fac = 1'], ['loop', 'Is i ≤ n ?', [['p', 'Fac = Fac × i'], ['p', 'i = i + 1']], [['io', 'Print Fac']]], 'E'] },
  { id: 'a8', title: 'Sum of first 10 natural numbers', q: 'Find the sum of the first 10 natural numbers.', steps: ['Start', 'Initialize i = 1, Sum = 0', 'While i ≤ 10: Sum = Sum + i; i = i + 1', 'Print Sum', 'Stop'], flow: ['S', ['p', 'i = 1, Sum = 0'], ['loop', 'Is i ≤ 10 ?', [['p', 'Sum = Sum + i'], ['p', 'i = i + 1']], [['io', 'Print Sum']]], 'E'] },
  { id: 'a9', title: 'Largest of three numbers', q: 'Find the largest of three numbers.', steps: ['Start', 'Read a, b, c', 'If a > b and a > c: print a', 'Else if b > c: print b', 'Else: print c', 'Stop'], flow: ['S', ['io', 'Read a, b, c'], ['d', 'a > b ?', [['d', 'a > c ?', [['io', 'Print a']], [['io', 'Print c']]]], [['d', 'b > c ?', [['io', 'Print b']], [['io', 'Print c']]]]], 'E'] }
];

/* ===== QUESTION BANK: C Programs (ALL with void main()) ===== */
export const PROGS = [
{ id: 'p1', mod: 1, topic: 'Basics', title: 'Print “Hello, World!”', q: 'Write a C program to print “Hello, World!”.', input: '', code: R`
// Program to print "Hello, World!"
#include <stdio.h>

void main()
{
    printf("Hello, World!");
}`, walk: 'Execution starts at void main(). printf sends the formatted string to the console.' },
{ id: 'p2', mod: 1, topic: 'Basics', title: 'Sum of two numbers', q: 'Write a C program to read two numbers and display the sum.', input: '7 5', code: R`
// Finding sum of two numbers
#include <stdio.h>

void main()
{
    int a, b, sum;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    sum = a + b;
    printf("Sum = %d", sum);
}`, walk: 'Read two numbers with scanf using &a and &b, add them, and display with %d.' },
{ id: 'p3', mod: 1, topic: 'Basics', title: 'Swap two floating-point numbers', q: 'Write a C program to swap two floating-point numbers.', input: '1.5 2.75', code: R`
#include <stdio.h>

void main()
{
    float num1, num2, temp;
    printf("Enter first number: \\n");
    scanf("%f", &num1);
    printf("Enter second number: \\n");
    scanf("%f", &num2);

    temp = num1;
    num1 = num2;
    num2 = temp;

    printf("After swapping \\n");
    printf("num1 = %f \\n", num1);
    printf("num2 = %f \\n", num2);
}`, walk: 'Use a temporary variable temp to hold num1 while transferring values.' },
{ id: 'p4', mod: 1, topic: 'Basics', title: 'Square root of an integer', q: 'Write a C program to find the square root of an integer.', input: '25', code: R`
#include <stdio.h>
#include <math.h>

void main()
{
    int num;
    float sq;
    printf("Enter an integer: ");
    scanf("%d", &num);
    sq = sqrt(num);
    printf("Square root of %d is %f", num, sq);
}`, walk: 'sqrt() from math.h computes the square root.' },
{ id: 'p5', mod: 1, topic: 'Basics', title: 'Volume of sphere & cylinder', q: 'Write a C program to calculate sphere and cylinder volumes.', input: '3 5', code: R`
#include <stdio.h>
#include <math.h>
#define PI 3.1416

void main()
{
    float rad, height, vols, volc;
    printf("Enter radius: \\n");
    scanf("%f", &rad);
    printf("Enter height: \\n");
    scanf("%f", &height);
    vols = 4 * PI * pow(rad, 3) / 3;
    volc = PI * rad * rad * height;
    printf("Volume of sphere is %f \\n", vols);
    printf("Volume of cylinder is %f \\n", volc);
}`, walk: 'Calculates 4/3*pi*r^3 and pi*r^2*h using void main().' },
{ id: 'p6', mod: 1, topic: 'Basics', title: 'Fahrenheit to Celsius', q: 'Convert temperature from Fahrenheit to Celsius: C = 5/9 * (F - 32).', input: '98.6', code: R`
#include <stdio.h>

void main()
{
    float cel, fahr;
    printf("Enter temperature in Fahrenheit: \\n");
    scanf("%f", &fahr);
    cel = (5 * (fahr - 32)) / 9;
    printf("%f in Fahrenheit is %f in Celsius", fahr, cel);
}`, walk: 'Multiplying by 5 before dividing by 9 avoids integer division truncation.' },
{ id: 'p7', mod: 2, topic: 'if-else', title: 'Largest of two numbers', q: 'Find largest of two numbers.', input: '14 9', code: R`
#include <stdio.h>

void main()
{
    int n1, n2;
    printf("Enter two numbers: \\n");
    scanf("%d %d", &n1, &n2);
    if (n1 > n2)
        printf("%d is larger \\n", n1);
    else
        printf("%d is larger \\n", n2);
}`, walk: 'Simple if-else comparing n1 and n2.' },
{ id: 'p8', mod: 2, topic: 'if-else', title: 'Odd or even', q: 'Check whether integer is odd or even.', input: '7', code: R`
#include <stdio.h>

void main()
{
    int num;
    printf("Enter number: \\n");
    scanf("%d", &num);
    if (num % 2 == 0)
        printf("%d is even! \\n", num);
    else
        printf("%d is odd! \\n", num);
}`, walk: 'num % 2 == 0 checks divisibility by 2.' },
{ id: 'p9', mod: 2, topic: 'if-else', title: 'Positive, negative or zero', q: 'Check if number is positive, negative or zero.', input: '-4', code: R`
#include <stdio.h>

void main()
{
    int num;
    printf("Enter number: \\n");
    scanf("%d", &num);
    if (num < 0)
        printf("%d is negative \\n", num);
    else if (num > 0)
        printf("%d is positive \\n", num);
    else
        printf("Number is zero \\n");
}`, walk: 'Three-way branching with else-if ladder.' },
{ id: 'p10', mod: 2, topic: 'if-else', title: 'Smallest of three (nested if)', q: 'Find smallest of three numbers using nested if.', input: '8 3 5', code: R`
#include <stdio.h>

void main()
{
    int n1, n2, n3;
    scanf("%d %d %d", &n1, &n2, &n3);
    if (n1 < n2)
    {
        if (n1 < n3)
            printf("%d is smaller \\n", n1);
        else
            printf("%d is smaller \\n", n3);
    }
    else
    {
        if (n2 < n3)
            printf("%d is smaller \\n", n2);
        else
            printf("%d is smaller \\n", n3);
    }
}`, walk: 'Nested if compares pairs step by step.' },
{ id: 'p11', mod: 2, topic: 'if-else', title: 'Smallest of three (ladder)', q: 'Find smallest of three numbers using else-if ladder.', input: '8 3 5', code: R`
#include <stdio.h>

void main()
{
    int n1, n2, n3;
    scanf("%d %d %d", &n1, &n2, &n3);
    if (n1 < n2 && n1 < n3)
        printf("%d is smaller \\n", n1);
    else if (n2 < n1 && n2 < n3)
        printf("%d is smaller \\n", n2);
    else
        printf("%d is smaller \\n", n3);
}`, walk: 'Compound conditions using &&.' },
{ id: 'p12', mod: 2, topic: 'if-else', title: 'Leap year', q: 'Check if given year is a leap year.', input: '2024', code: R`
#include <stdio.h>

void main()
{
    int year;
    printf("Enter year: ");
    scanf("%d", &year);
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)
        printf("%d is a leap year", year);
    else
        printf("%d is not a leap year", year);
}`, walk: 'Divisible by 4 and not 100, or divisible by 400.' },
{ id: 'p13', mod: 2, topic: 'if-else', title: 'Admission eligibility', q: 'Physics ≥ 50, Chemistry ≥ 50, Maths ≥ 60, Total ≥ 180.', input: '55 62 70', code: R`
#include <stdio.h>

void main()
{
    int phy, chem, math, total;
    scanf("%d %d %d", &phy, &chem, &math);
    total = phy + math + chem;
    if (phy >= 50 && chem >= 50 && math >= 60 && total >= 180)
        printf("You are eligible for admission!");
    else
        printf("You are not eligible for admission!");
}`, walk: 'All conditions verified.' },
{ id: 'p14', mod: 2, topic: 'if-else', title: 'Grade from percentage', q: 'Grade student: ≥90 A, ≥80 B, ≥70 C, ≥60 D, else F.', input: '85', code: R`
#include <stdio.h>

void main()
{
    float per;
    scanf("%f", &per);
    if (per >= 90) printf("Grade A");
    else if (per >= 80) printf("Grade B");
    else if (per >= 70) printf("Grade C");
    else if (per >= 60) printf("Grade D");
    else printf("Grade F");
}`, walk: 'Ladder checks from top grade down.' },
{ id: 'p15', mod: 2, topic: 'if-else', title: 'Voting eligibility', q: 'Check if candidate is eligible to vote (age ≥ 18).', input: '19', code: R`
#include <stdio.h>

void main()
{
    int age;
    scanf("%d", &age);
    if (age >= 18)
        printf("Eligible!");
    else
        printf("Not Eligible!");
}`, walk: 'Simple age comparison.' },
{ id: 'p16', mod: 2, topic: 'switch', title: 'Day of week', q: 'Display day name from 1-7.', input: '3', code: R`
#include <stdio.h>

void main()
{
    int day;
    scanf("%d", &day);
    switch (day)
    {
        case 1: printf("Sunday"); break;
        case 2: printf("Monday"); break;
        case 3: printf("Tuesday"); break;
        case 4: printf("Wednesday"); break;
        case 5: printf("Thursday"); break;
        case 6: printf("Friday"); break;
        case 7: printf("Saturday"); break;
        default: printf("Invalid day"); break;
    }
}`, walk: 'Switch with break after each case.' },
{ id: 'p17', mod: 2, topic: 'switch', title: 'Month name', q: 'Display month name from 1-12.', input: '8', code: R`
#include <stdio.h>

void main()
{
    int m;
    scanf("%d", &m);
    switch (m)
    {
        case 1: printf("January"); break;
        case 2: printf("February"); break;
        case 3: printf("March"); break;
        case 4: printf("April"); break;
        case 5: printf("May"); break;
        case 6: printf("June"); break;
        case 7: printf("July"); break;
        case 8: printf("August"); break;
        case 9: printf("September"); break;
        case 10: printf("October"); break;
        case 11: printf("November"); break;
        case 12: printf("December"); break;
        default: printf("Invalid month"); break;
    }
}`, walk: 'Twelve cases mapping numbers to months.' },
{ id: 'p18', mod: 2, topic: 'switch', title: 'Simple calculator', q: 'Read two numbers and operator (+, -, *, /) using switch.', input: '9 2 /', code: R`
#include <stdio.h>

void main()
{
    int a, b;
    char opr;
    scanf("%d %d", &a, &b);
    scanf(" %c", &opr);
    switch (opr)
    {
        case '+': printf("Sum = %d", a + b); break;
        case '-': printf("Diff = %d", a - b); break;
        case '*': printf("Product = %d", a * b); break;
        case '/': printf("Quotient = %f", (float)a / b); break;
        default: printf("Invalid operator");
    }
}`, walk: 'Cast to (float) for accurate division.' },
{ id: 'p19', mod: 2, topic: 'switch', title: 'Vowel or consonant', q: 'Check if character is vowel using switch.', input: 'e', code: R`
#include <stdio.h>

void main()
{
    char w;
    scanf(" %c", &w);
    switch (w)
    {
        case 'a': case 'e': case 'i': case 'o': case 'u':
        case 'A': case 'E': case 'I': case 'O': case 'U':
            printf("The character is a Vowel");
            break;
        default:
            printf("The character is a Consonant");
            break;
    }
}`, walk: 'Fall-through used intentionally for vowel cases.' },
{ id: 'p20', mod: 2, topic: 'Loops', title: 'Print 0 to 10', q: 'Print 0 to 10 using while loop.', input: '', code: R`
#include <stdio.h>

void main()
{
    int i = 0;
    while (i <= 10)
    {
        printf("%d\\t", i);
        i++;
    }
}`, alt: { label: 'Using for loop', code: R`
#include <stdio.h>

void main()
{
    int i;
    for (i = 0; i <= 10; i++)
        printf("%d\\t", i);
}` }, walk: 'Loop variable increments each round.' },
{ id: 'p21', mod: 2, topic: 'Loops', title: 'Sum of first 100 natural numbers', q: 'Sum numbers 1 to 100.', input: '', code: R`
#include <stdio.h>

void main()
{
    int i, sum = 0;
    for (i = 1; i <= 100; i++)
        sum = sum + i;
    printf("Sum = %d", sum);
}`, walk: 'Accumulates sum in a loop (5050).' },
{ id: 'p22', mod: 2, topic: 'Loops', title: 'Factorial of a number', q: 'Compute n factorial.', input: '5', code: R`
#include <stdio.h>

void main()
{
    int n, i, f = 1;
    scanf("%d", &n);
    for (i = 1; i <= n; i++)
        f = f * i;
    printf("Factorial of %d is %d", n, f);
}`, walk: 'Product accumulator starts at 1.' },
{ id: 'p23', mod: 2, topic: 'Loops', title: 'Sum of multiples of 3', q: 'Sum of multiples of 3 among n numbers.', input: '5\n3 4 6 9 10', code: R`
#include <stdio.h>

void main()
{
    int i, sum = 0, num, n;
    scanf("%d", &n);
    for (i = 1; i <= n; i++)
    {
        scanf("%d", &num);
        if (num % 3 == 0)
            sum = sum + num;
    }
    printf("Sum of multiples of 3 is %d", sum);
}`, walk: 'Adds numbers where num % 3 == 0.' },
{ id: 'p24', mod: 2, topic: 'Loops', title: 'Prime number check', q: 'Check whether a number is prime.', input: '29', code: R`
#include <stdio.h>

void main()
{
    int num, flag = 1, i;
    scanf("%d", &num);
    if (num <= 1)
        flag = 0;
    else
    {
        for (i = 2; i <= num / 2; i++)
        {
            if (num % i == 0)
            {
                flag = 0;
                break;
            }
        }
    }
    if (flag)
        printf("%d is prime", num);
    else
        printf("%d is not prime", num);
}`, walk: 'Flag variable detects divisibility.' },
{ id: 'p25', mod: 2, topic: 'Loops', title: 'Count the digits', q: 'Count number of digits in an integer.', input: '90210', code: R`
#include <stdio.h>

void main()
{
    int num, c = 0;
    scanf("%d", &num);
    while (num > 0)
    {
        num = num / 10;
        c++;
    }
    printf("The no. of digits = %d", c);
}`, walk: 'Dividing by 10 strips the last digit.' },
{ id: 'p26', mod: 2, topic: 'Loops', title: 'Sum of digits', q: 'Find sum of digits of a number.', input: '4321', code: R`
#include <stdio.h>

void main()
{
    int num, sum = 0, copy;
    scanf("%d", &num);
    copy = num;
    while (num > 0)
    {
        sum = sum + (num % 10);
        num = num / 10;
    }
    printf("Sum of digits of %d is %d", copy, sum);
}`, walk: 'num % 10 extracts digit, num / 10 removes it.' },
{ id: 'p27', mod: 2, topic: 'Loops', title: 'Reverse a number', q: 'Reverse a given number.', input: '1234', code: R`
#include <stdio.h>

void main()
{
    int num, rev = 0, copy;
    scanf("%d", &num);
    copy = num;
    while (num > 0)
    {
        rev = rev * 10 + (num % 10);
        num = num / 10;
    }
    printf("Reverse of %d is %d", copy, rev);
}`, walk: 'rev = rev * 10 + digit builds reverse.' },
{ id: 'p28', mod: 2, topic: 'Loops', title: 'Palindrome number', q: 'Check if a number is a palindrome.', input: '12321', code: R`
#include <stdio.h>

void main()
{
    int num, rev = 0, copy;
    scanf("%d", &num);
    copy = num;
    while (num > 0)
    {
        rev = rev * 10 + (num % 10);
        num = num / 10;
    }
    if (copy == rev)
        printf("%d is a palindrome", copy);
    else
        printf("%d is not a palindrome", copy);
}`, walk: 'Compares copy with reversed value.' },
{ id: 'p29', mod: 2, topic: 'Loops', title: 'Armstrong number', q: 'Check if number equals sum of cubes/powers of digits.', input: '153', code: R`
#include <stdio.h>
#include <math.h>

void main()
{
    int num, count = 0, copy, copy1, test = 0;
    scanf("%d", &num);
    copy = num; copy1 = num;
    while (num > 0) { num = num / 10; count++; }
    while (copy > 0)
    {
        test = test + pow(copy % 10, count);
        copy = copy / 10;
    }
    if (test == copy1)
        printf("%d is an Armstrong number", copy1);
    else
        printf("%d is not an Armstrong number", copy1);
}`, walk: '153 = 1^3 + 5^3 + 3^3.' },
{ id: 'p30', mod: 2, topic: 'Loops', title: 'Fibonacci series', q: 'Print first n Fibonacci terms.', input: '8', code: R`
#include <stdio.h>

void main()
{
    int n1 = 0, n2 = 1, n3, c = 2, n;
    scanf("%d", &n);
    printf("%d, %d", n1, n2);
    while (c < n)
    {
        n3 = n1 + n2;
        n1 = n2;
        n2 = n3;
        printf(", %d", n2);
        c++;
    }
}`, walk: 'Each term is sum of previous two.' },
{ id: 'p31', mod: 2, topic: 'Loops', title: 'break and continue', q: 'Demonstrate difference between break and continue.', input: '', code: R`
#include <stdio.h>

void main()
{
    int i;
    printf("With break:\\t");
    for (i = 0; i < 6; i++)
    {
        if (i == 4) break;
        printf("%d\\t", i);
    }
    printf("\\nWith continue:\\t");
    for (i = 0; i < 6; i++)
    {
        if (i == 4) continue;
        printf("%d\\t", i);
    }
}`, walk: 'break terminates loop; continue skips iteration.' }
];

/* ===== THEORY Q&A (All with void main()) ===== */
export const THEORY = [
{ q: 'Explain the components of a computer with a neat diagram.', a: `<p>A computer consists of: <b>Input</b>, <b>Output</b>, <b>Memory</b>, and <b>Processor (ALU, CU, Registers)</b>.</p><ul><li>ALU performs arithmetic and logic.</li><li>CU supervises operations.</li><li>Memory stores programs and data.</li></ul>` },
{ q: 'Write a note on processor registers.', a: `<ul><li><b>Program Counter (PC)</b>: stores address of next instruction to execute.</li><li><b>Instruction Register (IR)</b>: holds current instruction.</li><li><b>Address Register (AR)</b>: holds memory address being accessed.</li></ul>` },
{ q: 'Explain the memory hierarchy and units.', a: `<p>Hierarchy: Registers &gt; Cache &gt; Primary Memory (RAM) &gt; Secondary Memory. Moving toward registers, speed increases and capacity decreases.</p><p>Units: 1 byte = 8 bits, 1 KB = 1024 bytes (2<sup>10</sup>), 1 MB = 2<sup>20</sup> bytes.</p>` },
{ q: 'Differentiate between assembler, compiler and interpreter.', a: `<table class="tbl"><tr><th>Assembler</th><th>Compiler</th><th>Interpreter</th></tr><tr><td>Converts assembly to machine code</td><td>Translates whole high-level program at once</td><td>Translates line by line</td></tr><tr><td>System software</td><td>Generates object code</td><td>Does not produce object code</td></tr></table>` },
{ q: 'What is an algorithm? List its characteristics.', a: `<p>An algorithm is a finite step-by-step procedure to solve a problem. Characteristics: <b>Input</b>, <b>Output</b>, <b>Finiteness</b>, <b>Definiteness</b>, <b>Effectiveness</b>.</p>` },
{ q: 'What is a flowchart? Draw the standard symbols.', a: `<ul><li><b>Oval</b>: Start / Stop</li><li><b>Parallelogram</b>: Input / Output</li><li><b>Rectangle</b>: Processing</li><li><b>Diamond</b>: Decision (Yes/No branches)</li></ul>` },
{ q: 'Explain the structure of a C program.', a: `<p>Order: 1. Documentation, 2. Header files (<code>#include</code>), 3. Global declarations, 4. <code>void main()</code>, 5. Local variable declarations, 6. Statements.</p><pre class="plain">// Documentation\n#include &lt;stdio.h&gt;\nvoid main()\n{\n    int a;\n    printf("Hi");\n}</pre>` },
{ q: 'Explain the working of the Hello World program.', a: `<ul><li><code>#include &lt;stdio.h&gt;</code>: Includes standard input/output header.</li><li><code>void main()</code>: Program execution starts here. Void specifies no return value.</li><li><code>printf(...)</code>: Outputs text to terminal.</li><li><code>;</code>: Statement terminator.</li></ul>` },
{ q: 'What are format specifiers and escape sequences?', a: `<p><b>Format specifiers</b>: <code>%d</code> (int), <code>%f</code> (float), <code>%c</code> (char), <code>%lf</code> (double).</p><p><b>Escape sequences</b>: <code>\\n</code> (newline), <code>\\t</code> (tab).</p>` },
{ q: 'What is a token? Name the token types in C.', a: `<p>The smallest individual unit in a program. Types: Keywords (32), Identifiers, Constants, Strings, Special symbols, Operators.</p>` },
{ q: 'State the rules for naming an identifier.', a: `<ol><li>Contains letters, digits, and underscores.</li><li>Must begin with a letter or underscore.</li><li>Cannot be a keyword.</li><li>No whitespace.</li><li>Case sensitive (<code>Sum</code> != <code>sum</code>).</li></ol>` },
{ q: 'Explain data types in C.', a: `<p>Primitive (int, float, double, char), Derived (arrays, pointers, structures), User-defined (typedef, enum).</p>` },
{ q: 'Explain the different types of operators in C.', a: `<p>Arithmetic, Relational, Logical, Assignment, Increment/Decrement, Conditional (ternary), Bitwise, Special (sizeof).</p>` },
{ q: 'Differentiate between a++ and ++a.', a: `<p><code>a++</code> (post-increment): uses current value first, then increments. <code>++a</code> (pre-increment): increments first, then uses new value.</p>` },
{ q: 'Explain the ternary (conditional) operator with syntax.', a: `<p>Syntax: <code>(condition) ? value_if_true : value_if_false;</code></p><p>Example: <code>int x = (a &gt; b) ? a : b;</code></p>` },
{ q: 'Explain the four variants of the if statement.', a: `<ol><li>Simple if: <code>if (cond) stmt;</code></li><li>if-else: <code>if (cond) stmt1; else stmt2;</code></li><li>Nested if: an if inside another if</li><li>else-if ladder: multiple sequential condition checks</li></ol>` },
{ q: 'Explain the switch statement. Role of break and default?', a: `<p>Multiway branching based on int or char value. <b>break</b> exits switch to prevent fall-through. <b>default</b> executes when no case matches.</p>` },
{ q: 'Differentiate between while, do-while and for loops.', a: `<p><b>while</b>: entry-controlled (tests condition before body). <b>do-while</b>: exit-controlled (executes at least once, checks at end). <b>for</b>: compact init, test, and update in one line.</p>` },
{ q: 'Differentiate between break and continue.', a: `<p><b>break</b> terminates the loop completely. <b>continue</b> skips only the current iteration and jumps to the next cycle.</p>` },
{ q: 'What is math.h and how is it used?', a: `<p>Provides mathematical functions like <code>sqrt()</code> and <code>pow()</code>. Compile with <code>gcc name.c -lm</code>.</p>` }
];

/* ===== CHALLENGES (All solutions with void main()) ===== */
export const CHALLENGES = [
{ id: 'c1', title: 'Say hello', diff: 1, task: 'Print exactly: <code>Hello, World!</code>', tests: [{ in: '', out: ['Hello, World!'] }], hints: ['Use printf with the text in double quotes.', 'Do not forget the semicolon.', 'printf("Hello, World!");'], sol: R`
#include <stdio.h>

void main()
{
    printf("Hello, World!");
}` },
{ id: 'c2', title: 'Add two numbers', diff: 1, task: 'Read two integers and print their sum.', tests: [{ in: '7 5', out: ['12'] }, { in: '-3 10', out: ['7'] }], hints: ['Declare int a, b; and read with scanf("%d %d", &a, &b);', 'printf("Sum = %d", a + b);'], sol: R`
#include <stdio.h>

void main()
{
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Sum = %d", a + b);
}` },
{ id: 'c3', title: 'Square and cube', diff: 1, task: 'Read an integer and print its square and cube.', tests: [{ in: '4', out: ['16', '64'] }, { in: '3', out: ['9', '27'] }], hints: ['Read a with scanf.', 'sq = a * a; cu = sq * a;'], sol: R`
#include <stdio.h>

void main()
{
    int a, sq, cu;
    scanf("%d", &a);
    sq = a * a;
    cu = sq * a;
    printf("Square = %d, Cube = %d", sq, cu);
}` },
{ id: 'c4', title: 'Odd or even', diff: 1, task: 'Read an integer. Print <code>even</code> or <code>odd</code>.', tests: [{ in: '8', out: ['even'], no: ['odd'] }, { in: '7', out: ['odd'], no: ['even'] }], hints: ['Use remainder operator %.', 'if (num % 2 == 0) printf("even"); else printf("odd");'], sol: R`
#include <stdio.h>

void main()
{
    int num;
    scanf("%d", &num);
    if (num % 2 == 0)
        printf("%d is even", num);
    else
        printf("%d is odd", num);
}` },
{ id: 'c5', title: 'Largest of three', diff: 2, task: 'Read three integers and print the largest.', tests: [{ in: '3 9 5', out: ['9'] }, { in: '12 4 12', out: ['12'] }, { in: '-5 -2 -9', out: ['-2'] }], hints: ['Use && to compare against both numbers.', 'if (a >= b && a >= c) ...'], sol: R`
#include <stdio.h>

void main()
{
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    if (a >= b && a >= c)
        printf("Largest = %d", a);
    else if (b >= a && b >= c)
        printf("Largest = %d", b);
    else
        printf("Largest = %d", c);
}` },
{ id: 'c6', title: 'Grade ladder', diff: 2, task: 'Read percentage. Print grade: ≥90 A, ≥80 B, ≥70 C, ≥60 D, else F.', tests: [{ in: '95', out: ['A'] }, { in: '85', out: ['B'] }, { in: '72', out: ['C'] }, { in: '65', out: ['D'] }, { in: '40', out: ['F'] }], hints: ['Use else-if ladder starting from top.'], sol: R`
#include <stdio.h>

void main()
{
    int per;
    scanf("%d", &per);
    if (per >= 90) printf("Grade A");
    else if (per >= 80) printf("Grade B");
    else if (per >= 70) printf("Grade C");
    else if (per >= 60) printf("Grade D");
    else printf("Grade F");
}` },
{ id: 'c7', title: 'Leap year', diff: 2, task: 'Read year. Print <code>leap</code> or <code>not leap</code>.', tests: [{ in: '2024', out: ['leap'], no: ['not'] }, { in: '1900', out: ['not leap'] }, { in: '2000', out: ['leap'], no: ['not'] }], hints: ['(y % 4 == 0 && y % 100 != 0) || y % 400 == 0'], sol: R`
#include <stdio.h>

void main()
{
    int y;
    scanf("%d", &y);
    if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0)
        printf("leap");
    else
        printf("not leap");
}` },
{ id: 'c8', title: 'Vowel or consonant (switch)', diff: 2, task: 'Read character, use switch to print <code>vowel</code> or <code>consonant</code>.', tests: [{ in: 'e', out: ['vowel'], no: ['consonant'] }, { in: 'z', out: ['consonant'] }, { in: 'A', out: ['vowel'], no: ['consonant'] }], hints: ['Stack case labels: case \'a\': case \'e\': ...'], sol: R`
#include <stdio.h>

void main()
{
    char ch;
    scanf(" %c", &ch);
    switch (ch)
    {
        case 'a': case 'e': case 'i': case 'o': case 'u':
        case 'A': case 'E': case 'I': case 'O': case 'U':
            printf("vowel");
            break;
        default:
            printf("consonant");
    }
}` },
{ id: 'c9', title: 'Calculator', diff: 2, task: 'Read two numbers and operator (+, -, *, /) and print result using switch.', tests: [{ in: '8 2 +', out: ['10'] }, { in: '8 2 -', out: ['6'] }, { in: '8 2 *', out: ['16'] }, { in: '8 2 /', out: ['4'] }], hints: ['scanf(" %c", &op) with leading space.'], sol: R`
#include <stdio.h>

void main()
{
    int a, b;
    char op;
    scanf("%d %d", &a, &b);
    scanf(" %c", &op);
    switch (op)
    {
        case '+': printf("%d", a + b); break;
        case '-': printf("%d", a - b); break;
        case '*': printf("%d", a * b); break;
        case '/': printf("%d", a / b); break;
        default: printf("Invalid");
    }
}` },
{ id: 'c10', title: 'Sum from 1 to n', diff: 2, task: 'Read n and print 1 + 2 + ... + n.', tests: [{ in: '10', out: ['55'] }, { in: '100', out: ['5050'] }], hints: ['sum = 0; for (i = 1; i <= n; i++) sum += i;'], sol: R`
#include <stdio.h>

void main()
{
    int n, i, sum = 0;
    scanf("%d", &n);
    for (i = 1; i <= n; i++)
        sum = sum + i;
    printf("Sum = %d", sum);
}` },
{ id: 'c11', title: 'Factorial', diff: 2, task: 'Read n and print n!.', tests: [{ in: '5', out: ['120'] }, { in: '6', out: ['720'] }], hints: ['f = 1; for (i = 1; i <= n; i++) f *= i;'], sol: R`
#include <stdio.h>

void main()
{
    int n, i, f = 1;
    scanf("%d", &n);
    for (i = 1; i <= n; i++)
        f = f * i;
    printf("Factorial = %d", f);
}` },
{ id: 'c12', title: 'Multiplication table', diff: 2, task: 'Print table of n from n*1 to n*10 separated by space.', tests: [{ in: '3', out: ['3', '6', '9', '12', '15', '18', '21', '24', '27', '30'] }], hints: ['for (i = 1; i <= 10; i++) printf("%d ", n * i);'], sol: R`
#include <stdio.h>

void main()
{
    int n, i;
    scanf("%d", &n);
    for (i = 1; i <= 10; i++)
        printf("%d ", n * i);
}` },
{ id: 'c13', title: 'Count the digits', diff: 3, task: 'Read positive integer and print count of digits.', tests: [{ in: '12345', out: ['5'] }, { in: '7', out: ['1'] }], hints: ['while (num > 0) { num /= 10; count++; }'], sol: R`
#include <stdio.h>

void main()
{
    int num, c = 0;
    scanf("%d", &num);
    while (num > 0)
    {
        num = num / 10;
        c++;
    }
    printf("Digits = %d", c);
}` },
{ id: 'c14', title: 'Sum of digits', diff: 3, task: 'Read positive integer and print sum of digits.', tests: [{ in: '4321', out: ['10'] }, { in: '999', out: ['27'] }], hints: ['sum += num % 10; num /= 10;'], sol: R`
#include <stdio.h>

void main()
{
    int num, sum = 0;
    scanf("%d", &num);
    while (num > 0)
    {
        sum = sum + num % 10;
        num = num / 10;
    }
    printf("Sum of digits = %d", sum);
}` },
{ id: 'c15', title: 'Reverse a number', diff: 3, task: 'Read positive integer and print reversed.', tests: [{ in: '1234', out: ['4321'] }, { in: '120', out: ['21'] }], hints: ['rev = rev * 10 + (num % 10);'], sol: R`
#include <stdio.h>

void main()
{
    int num, rev = 0;
    scanf("%d", &num);
    while (num > 0)
    {
        rev = rev * 10 + num % 10;
        num = num / 10;
    }
    printf("Reverse = %d", rev);
}` },
{ id: 'c16', title: 'Prime or not', diff: 3, task: 'Read integer, print <code>prime</code> or <code>not prime</code>.', tests: [{ in: '7', out: ['prime'], no: ['not'] }, { in: '9', out: ['not prime'] }], hints: ['Check divisors from 2 to num / 2.'], sol: R`
#include <stdio.h>

void main()
{
    int num, i, flag = 1;
    scanf("%d", &num);
    if (num <= 1) flag = 0;
    else
        for (i = 2; i <= num / 2; i++)
            if (num % i == 0) { flag = 0; break; }
    if (flag) printf("prime"); else printf("not prime");
}` },
{ id: 'c17', title: 'Palindrome number', diff: 3, task: 'Print <code>palindrome</code> or <code>not palindrome</code>.', tests: [{ in: '121', out: ['palindrome'], no: ['not'] }, { in: '123', out: ['not palindrome'] }], hints: ['Reverse number, then compare copy == rev.'], sol: R`
#include <stdio.h>

void main()
{
    int num, copy, rev = 0;
    scanf("%d", &num);
    copy = num;
    while (num > 0)
    {
        rev = rev * 10 + num % 10;
        num = num / 10;
    }
    if (copy == rev) printf("palindrome"); else printf("not palindrome");
}` },
{ id: 'c18', title: 'Armstrong number', diff: 4, task: 'Print <code>armstrong</code> or <code>not armstrong</code>.', tests: [{ in: '153', out: ['armstrong'], no: ['not'] }, { in: '154', out: ['not armstrong'] }], hints: ['Count digits, then sum digit^count.'], sol: R`
#include <stdio.h>
#include <math.h>

void main()
{
    int num, copy, copy1, digit, count = 0, test = 0;
    scanf("%d", &num);
    copy = num; copy1 = num;
    while (num > 0) { num = num / 10; count++; }
    while (copy > 0)
    {
        digit = copy % 10;
        test = test + pow(digit, count);
        copy = copy / 10;
    }
    if (test == copy1) printf("armstrong"); else printf("not armstrong");
}` },
{ id: 'c19', title: 'Fibonacci series', diff: 4, task: 'Print first n Fibonacci terms starting <code>0 1 1 2 ...</code>.', tests: [{ in: '7', out: ['0', '1', '1', '2', '3', '5', '8'] }], hints: ['n3 = n1 + n2; n1 = n2; n2 = n3;'], sol: R`
#include <stdio.h>

void main()
{
    int n, n1 = 0, n2 = 1, n3, c = 2;
    scanf("%d", &n);
    printf("%d %d", n1, n2);
    while (c < n)
    {
        n3 = n1 + n2;
        n1 = n2;
        n2 = n3;
        printf(" %d", n3);
        c++;
    }
}` }
];

/* ===== GLOSSARY & TIPS ===== */
export const GLOSSARY: Array<[string, string]> = [
  ['alu', 'ALU = Arithmetic Logic Unit. The part of the CPU that calculates (+ − × ÷) and compares (< > ==).'],
  ['cu|control unit', 'Control Unit. Coordinates and directs all operations inside the CPU.'],
  ['registers|program counter|instruction register', 'Fast internal storage: Program Counter (address of next instruction), Instruction Register (current instruction), Address Register.'],
  ['compiler|gcc', 'Converts high-level source code into machine/object code all at once. We compile with gcc.'],
  ['main|void main', 'Execution starts at <code>void main()</code> in our syllabus. It does not return any value.'],
  ['void', '<code>void</code> specifies no return value or empty parameters. In <code>void main()</code>, main returns nothing.'],
  ['printf', 'Prints formatted text to the screen. E.g. <code>printf("Sum = %d", sum);</code>.'],
  ['scanf', 'Reads formatted input. Requires format specifier and address (&), e.g. <code>scanf("%d", &amp;x);</code>.'],
  ['token', 'The smallest element in a C program: keyword, identifier, constant, string, operator, or special symbol.'],
  ['datatype|int|float|double|char', 'Basic types: int (4B), float (4B), double (8B), char (1B).'],
  ['ternary', 'Conditional operator <code>(condition) ? true_val : false_val</code>.'],
  ['switch', 'Multi-way branching based on int or char value. Uses <code>case</code>, <code>break</code>, and <code>default</code>.']
];

export const JOKES = [
  'Why do programmers prefer dark mode? Because light attracts bugs. 🐛',
  'There are 10 types of people: those who understand binary, and those who don’t.',
  'Why did the C developer wear glasses? Because he couldn’t C#.'
];

export const EXAM_TIPS = [
  'Always begin with <code>#include &lt;stdio.h&gt;</code> and <code>void main()</code>!',
  'Remember the <code>&amp;</code> in <code>scanf("%d", &amp;x);</code>. printf does NOT take &.',
  'Compare with <code>==</code>, not single <code>=</code>.',
  'End every C statement with a semicolon <code>;</code>.',
  'Integer division truncates: <code>5 / 9</code> is 0. Use <code>5.0 / 9</code> for decimals.',
  'In switch statements, remember to write <code>break;</code> after each case.'
];
