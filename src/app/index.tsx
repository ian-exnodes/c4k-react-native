import { Redirect } from 'expo-router';

export default function Index() {
  // typedRoutes workaround: router.d.ts not yet regenerated for (app) group;
  // regenerates on next `expo start`. Route is correct at runtime.
  return <Redirect href={'/(app)' as never} />;
}
