package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	_ "backend/migrations"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"go.uber.org/zap"
)

func main() {
	logger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	defer logger.Sync()

	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: filepath.Join(".", "pb_data"),
	})

	isGoRun := len(os.Args) > 0 && strings.Contains(os.Args[0], "go-build")
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: isGoRun,
	})

	// 公开按缩写查询接口（不经过 collection 的 ListRule，供未登录用户使用）
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/nlang/query", func(e *core.RequestEvent) error {
			abbrev := e.Request.URL.Query().Get("abbrev")
			if abbrev == "" {
				return e.BadRequestError("缺少 abbrev 参数", nil)
			}
			records, err := e.App.FindRecordsByFilter(
				"nlang_entries",
				"abbrev = {:abbrev}",
				"",
				100,
				0,
				dbx.Params{"abbrev": abbrev},
			)
			if err != nil {
				return e.BadRequestError("查询失败", err)
			}
			items := make([]map[string]any, 0, len(records))
			for _, r := range records {
				items = append(items, r.PublicExport())
			}
			return e.JSON(http.StatusOK, map[string]any{"items": items})
		})
		return se.Next()
	})

	if err := app.Start(); err != nil {
		logger.Fatal("app start failed", zap.Error(err))
	}
}
