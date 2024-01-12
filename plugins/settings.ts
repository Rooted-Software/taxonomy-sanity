/**
 * This plugin contains all the logic for setting up the `Settings` singleton
 */
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { definePlugin, type DocumentDefinition } from 'sanity'
import { type StructureResolver } from 'sanity/desk'

export const settingsPlugin = definePlugin<{ type: string }>(({ type }) => {
  return {
    name: 'settings',
    document: {
      // Hide 'Settings' from new document options
      // https://user-images.githubusercontent.com/81981/195728798-e0c6cf7e-d442-4e58-af3a-8cd99d7fcc28.png
      newDocumentOptions: (prev, { creationContext }) => {
        if (creationContext.type === 'global') {
          return prev.filter((templateItem) => templateItem.templateId !== type)
        }

        return prev
      },
      // Removes the "duplicate" action on the "settings" singleton
      actions: (prev, { schemaType }) => {
        if (schemaType === type) {
          return prev.filter(({ action }) => action !== 'duplicate')
        }

        return prev
      },
    },
  }
})

// The StructureResolver is how we're changing the DeskTool structure to linking to a single "Settings" document, instead of rendering "settings" in a list
// like how "Post" and "Author" is handled.
export const settingsStructure = (
  typeDef: DocumentDefinition
): StructureResolver => {
  return (S, context) => {
    // The `Settings` root list item
    const settingsListItem = // A singleton not using `documentListItem`, eg no built-in preview
      S.listItem()
        .title(typeDef.title || '')
        .icon(typeDef.icon)
        .child(
          S.editor()
            .id(typeDef.name)
            .schemaType(typeDef.name)
            .documentId(typeDef.name)
        )

    // The default root list items (except custom ones)
    const defaultListItems = S.documentTypeListItems().filter(
      (listItem) =>
        listItem.getId() !== typeDef.name &&
        listItem.getId() !== 'post' &&
        listItem.getId() !== 'features' &&
        listItem.getId() !== 'documentation' &&
        listItem.getId() !== 'docCategory'
    )

    // need to figure out how to add a orderableDocumentListDeskItem for the features sidebar
    // this will allow us to sort the list items / features

    // need to figure out where the listItems are located
    // find the name for features
    // then add listItem.getId() !== 'feature'

    return S.list()
      .title('Content')
      .items([
        orderableDocumentListDeskItem({
          type: 'post',
          title: 'Posts',

          // Required if using multiple lists of the same 'type'
          id: 'orderable-posts',
          // See notes on adding a `filter` below
          params: {
            lang: 'en_US',
          },
          // pass from the structure callback params above
          S,
          context,
        }),
        orderableDocumentListDeskItem({
          type: 'documentation',
          title: 'Documentation Articles',

          // Required if using multiple lists of the same 'type'
          id: 'orderable-documentation',
          // See notes on adding a `filter` below
          params: {
            lang: 'en_US',
          },
          // pass from the structure callback params above
          S,
          context,
        }),
        orderableDocumentListDeskItem({
          type: 'docCategory',
          title: 'Documentation Category',

          // Required if using multiple lists of the same 'type'
          id: 'orderable-docCategory',
          // See notes on adding a `filter` below
          params: {
            lang: 'en_US',
          },
          // pass from the structure callback params above
          S,
          context,
        }),
        ...defaultListItems,
        orderableDocumentListDeskItem({
          type: 'features',
          title: 'Features',

          // Required if using multiple lists of the same 'type'
          id: 'orderable-features',
          // See notes on adding a `filter` below
          params: {
            lang: 'en_US',
          },
          // pass from the structure callback params above
          S,
          context,
        }),
        S.divider(),
        settingsListItem,
      ])
  }
}
