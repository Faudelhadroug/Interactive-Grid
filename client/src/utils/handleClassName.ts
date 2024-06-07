export function inverseClassName(element1: HTMLElement, class1: string, element2: HTMLElement, class2: string) {
  element1.classList.remove(class1)
  element2.classList.remove(class2)

  element1.classList.add(class2)
  element2.classList.add(class1)
}

export function transfertClassName(element: HTMLElement, nameOfClass: string, element2: HTMLElement) {
  element.classList.remove(nameOfClass)
  element2.classList.add(nameOfClass)
}
