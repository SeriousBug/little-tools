## Running Commands

Use bun.

### Development Server Example Command and Successful Output

```
$ bun run dev

♻️  Generating routes...
✅ Processed routes in 449ms

  VITE v6.2.5  ready in 708 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

This will start the development server on port 3000 and watch for changes. The command will not exit.

### Running Tests Example Command and Successful Output

```
$ bun run test

♻️  Generating routes...
✅ Processed routes in 45ms

 RUN  v3.1.1 /Users/kaan/Code/little-tools

 ✓ src/timestamps/timestamp.test.tsx (5 tests) 57ms
   ✓ renders the timestamp converter 26ms
   ✓ converts millisecond timestamp correctly 9ms
   ✓ converts second timestamp correctly 7ms
   ✓ allows overriding the timestamp format 10ms
   ✓ displays formatted timestamp based on format selection 6ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  02:24:55
   Duration  406ms (transform 34ms, setup 0ms, collect 83ms, tests 57ms, environment 86ms, prepare 27ms)
```

The test command will exit after running the tests.
