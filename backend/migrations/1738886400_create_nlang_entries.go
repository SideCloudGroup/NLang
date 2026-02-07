package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewBaseCollection("nlang_entries")
		// 公开只读：允许未认证用户 list/view
		collection.ListRule = types.Pointer("")
		collection.ViewRule = types.Pointer("")
		// create/update/delete 不设置，仅超级用户可写

		collection.Fields.Add(
			&core.TextField{
				Name:     "abbrev",
				Required: true,
			},
			&core.TextField{
				Name:     "meaning",
				Required: true,
			},
		)
		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("nlang_entries")
		if err != nil {
			return err
		}
		return app.Delete(collection)
	})
}
