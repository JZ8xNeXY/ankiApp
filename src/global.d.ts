import 'react'

// React 19's types moved the JSX namespace from global scope into React.JSX.
// Restore the global alias so existing `JSX.Element` annotations keep working.
declare global {
  namespace JSX {
    type Element = React.JSX.Element
  }
}
