import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'

const Term = (): JSX.Element => {
  return (
    <ScrollView style={styles.container}>
      <View>
      <Text style={styles.title}>利用規約・プライバシーポリシー</Text>
      </View>

      <Text style={styles.sectionTitle}>■ 利用規約</Text>
      <Text style={styles.text}>
        このアプリは、語学学習を目的としたフラッシュカード学習支援ツールです。
        ご利用にあたっては、自己責任で行ってください。
        運営者は、データの消失や不具合による損害について一切の責任を負いません。
      </Text>

      <Text style={styles.sectionTitle}>■ プライバシーポリシー</Text>
      <Text style={styles.text}>
        本アプリは、メールアドレスなどの個人情報を取得する場合があります。
        取得した個人情報は、ユーザー管理およびサービス改善のために使用し、
        本人の同意なく第三者に提供することはありません。
      </Text>

      <Text style={styles.sectionTitle}>■ お問い合わせ</Text>
      <Text style={styles.text}>
        お問い合わせは以下のフォームよりお願いいたします：
        {'\n'}https://docs.google.com/forms/d/1d9DFnJrN1fBiRtKGn5e_FzcQygW_utP4YpkfsJDGueQ/viewform
      </Text>

      <Text style={styles.footer}>最終更新日: 2025年4月28日</Text>
    </ScrollView>
  )
}

export default Term

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  footer: {
    marginTop: 32,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
})