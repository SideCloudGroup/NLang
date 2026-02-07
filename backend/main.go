package main

import (
	"os"
	"path/filepath"
	"strings"

	_ "backend/migrations"

	"github.com/pocketbase/pocketbase"
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

	if err := app.Start(); err != nil {
		logger.Fatal("app start failed", zap.Error(err))
	}
}
