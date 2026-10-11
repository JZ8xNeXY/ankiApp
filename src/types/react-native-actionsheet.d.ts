declare module 'react-native-actionsheet' {
  import { Component } from 'react'

  interface ActionSheetProps {
    title?: string
    options: string[]
    cancelButtonIndex?: number
    destructiveButtonIndex?: number
    onPress?: (index: number) => void
  }

  export default class ActionSheet extends Component<ActionSheetProps> {
    show(): void
  }
}
