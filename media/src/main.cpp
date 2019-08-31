#include <QApplication>

#ifdef VID
  #include <QtAVWidgets>
#endif

#include <compsky/mysql/mysql.hpp> // for compsky::mysql::*, BUF, BUF_INDX

#include "mainwindow.hpp"


namespace _mysql {
	MYSQL* obj;
	constexpr static const size_t auth_sz = 512;
	char auth[auth_sz];
}


int dummy_argc = 0;
char** dummy_argv;


int main(const int argc,  const char** argv){
    compsky::mysql::init(_mysql::obj, _mysql::auth, _mysql::auth_sz, getenv("TAGEM_MYSQL_CFG"));
	
	const char* const inlist_filter_rule = argv[1];
	
  #ifdef VID
    QtAV::Widgets::registerRenderers();
  #endif
    QApplication app(dummy_argc, dummy_argv);
    MainWindow player;
	if (inlist_filter_rule != nullptr)
		player.inlist_filter_dialog->load_and_apply_from(inlist_filter_rule);
    player.show();
    
    int rc = app.exec();
    compsky::mysql::wipe_auth(_mysql::auth, _mysql::auth_sz);
    return rc;
}
