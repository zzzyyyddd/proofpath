// Run Node's test harness in this process. Sandbox child-process output capture
// can hide nested test reports; direct imports expose every registered assertion.
import '../tests/unit/evidence.test';
import '../tests/unit/limits.test';
import '../tests/unit/provider.test';
