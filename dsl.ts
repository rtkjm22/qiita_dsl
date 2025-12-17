type Action = () => void
type Target = number | string | boolean
type Case = { condition: () => boolean; action: Action }
type Rule = {
  もし: <T extends Target>(value: T) => IfBuilder<T>
  適用する: () => void
}
type NumOps = {
  なら: (action: Action) => Rule
  以上なら: (action: Action) => Rule
  以下なら: (action: Action) => Rule
  より大きいなら: (action: Action) => Rule
  より小さいなら: (action: Action) => Rule
}
type EqOps = {
  なら: (action: Action) => Rule
}
type OpsFor<T> = T extends number ? NumOps : EqOps
type IfBuilder<T extends Target> = {
  が: (target: T) => OpsFor<T>
}

/**
 * 判定項目の条件と条件が正の場合の処理を定義します
 * add: 条件の判定式（condition）と、conditionが正の場合に実行される処理（action）がまとめられたCase型のオブジェクトをcasesにプッシュします
 * run: addによって追加されたcase配列を順に実行します
 */
const createCases = () => {
  const cases: Case[] = []

  return {
    add: (condition: () => boolean, action: Action) =>
      cases.push({ condition, action }),
    run: () => {
      for (const r of cases) {
        if (r.condition()) r.action()
      }
    }
  }
}

export const ルール = (): Rule => {
  // Caseの空配列を生成
  const cases = createCases()

  const rule: Rule = {
    /**
     * 「が」の引数がnumber型の場合、NumOps型の関数が入るため、「もし」の引数との大小も判定できます。
     * 「が」の引数がnumber型以外の場合、EqOps型の関数が入るため、「もし」の引数と等しいかどうかを判定できます。
     */
    もし: <T extends Target>(value: T): IfBuilder<T> => ({
      が: (target: T) => {
        const addRule = (condition: () => boolean, action: Action) => {
          cases.add(condition, action)
          return rule
        }
        const eq = (action: Action) => addRule(() => value === target, action)

        if (typeof value === 'number' && typeof target === 'number') {
          const v = value
          const t = target

          const ops: NumOps = {
            なら: (action) => eq(action),
            以上なら: (action) => addRule(() => v >= t, action),
            以下なら: (action) => addRule(() => v <= t, action),
            より大きいなら: (action) => addRule(() => v > t, action),
            より小さいなら: (action) => addRule(() => v < t, action)
          }

          return ops as OpsFor<T>
        }

        const ops: EqOps = {
          なら: (action) => eq(action)
        }

        return ops as OpsFor<T>
      }
    }),

    /**
     * 「もし・が・なら」で蓄積されたCase型のオブジェクトを順々に実行します
     */
    適用する: () => cases.run()
  }

  return rule
}
