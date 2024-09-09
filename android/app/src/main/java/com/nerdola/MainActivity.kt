package com.nerdola

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import java.util.Timer
import java.util.TimerTask
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.UpdateAvailability
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.gms.tasks.Task
import com.google.android.play.core.appupdate.AppUpdateInfo
import android.content.IntentSender
import com.google.android.material.snackbar.Snackbar
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.InstallStatus
import android.content.Intent
import android.content.res.Configuration

private const val MY_REQUEST_CODE = 100

class MainActivity : ReactActivity() {

  private lateinit var appUpdateManager: AppUpdateManager
  
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "nerdola"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null);

    appUpdateManager = AppUpdateManagerFactory.create(this)

    val timer = Timer()
    timer.schedule(object : TimerTask() {
      override fun run() {
        runOnUiThread {
          CheckForAppUpdate()
        }
      }
    }, 3000)
  }

  private fun CheckForAppUpdate() {
    appUpdateManager?.let { manager ->
      val appUpdateInfoTask: Task<AppUpdateInfo> = manager.appUpdateInfo

      appUpdateInfoTask.addOnSuccessListener { appUpdateInfo ->
        if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
          appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
          try {
            manager.startUpdateFlowForResult(
              appUpdateInfo,
              AppUpdateType.FLEXIBLE,
              this,
              MY_REQUEST_CODE
            )
          } catch (e: IntentSender.SendIntentException) {
              throw RuntimeException(e)
          }
        }
      }
      manager.registerListener(listener)
    }
  }

  private val listener = InstallStateUpdatedListener { state ->
    if (state.installStatus() == InstallStatus.DOWNLOADED) {
      popupSnackbarForCompleteUpdate()
    }
  }

  private fun popupSnackbarForCompleteUpdate() {
    val snackbar = Snackbar.make(
      findViewById(android.R.id.content),
      "Uma atualização acabou de ser baixada.",
      Snackbar.LENGTH_INDEFINITE
    )
    snackbar.setTextColor(resources.getColor(android.R.color.white, null))
    snackbar.setAction("INSTALAR") {
      appUpdateManager.completeUpdate()
    }
    snackbar.setActionTextColor(resources.getColor(android.R.color.white, null))
    Snackbar.show()
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    val intent = Intent("onConfigurationChanged")
    intent.putExtra("newConfig", newConfig)
    this.sendBroadcast(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
  }

  override fun onStop() {
    super.onStop()
    appUpdateManager?.unregisterListener(listener)
  }

  override fun onResume() {
    super.onResume()
    appUpdateManager?.let { manager ->
      val timer = Timer()
      timer.schedule(object : TimerTask() {
        override fun run() {
          runOnUiThread {
            manager.appUpdateInfo.addOnSuccessListener { appUpdateInfo ->
              if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
                popupSnackbarForCompleteUpdate()
              }
            }
          }
        }
      }, 3000)
    }
  }
  
}
