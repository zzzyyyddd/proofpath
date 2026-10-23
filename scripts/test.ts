// Run Node's test harness in this process. Sandbox child-process output capture
// can hide nested test reports; direct imports expose every registered assertion.
import '../tests/unit/evidence.test';
import '../tests/unit/limits.test';
import '../tests/unit/provider.test';
import '../tests/unit/documents.test';
import '../tests/unit/routes.test';
import '../tests/unit/sample.test';
import '../tests/unit/streams.test';
import '../tests/unit/evaluation.test';
import '../tests/unit/single-request.test';
import '../tests/unit/maximum.test';
import '../tests/unit/provider-timeouts.test';
import '../tests/unit/semantic-regressions.test';
